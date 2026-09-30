import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

const allowedOrigins = [
"http://localhost:3000",
process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
cors: {
origin: allowedOrigins,
methods: ["GET", "POST"],
credentials: true,
},
});

const userSocketMap = new Map();

export const getReceiverSocketId = (receiverId) => {
const sockets = userSocketMap.get(receiverId);

if (!sockets || sockets.size === 0) {
return null;
}

return [...sockets][0];
};

const canSeePresence = async (viewerId, targetUserId, privacySetting) => {
if (viewerId === targetUserId) {
return true;
}

if (privacySetting === "everyone") {
return true;
}

if (privacySetting === "nobody") {
return false;
}

if (privacySetting === "contacts") {
const conversation = await Conversation.findOne({
participants: {
$all: [viewerId, targetUserId],
},
}).select("_id");

return Boolean(conversation);
}

return false;
};

const getVisibleOnlineUsers = async (viewerId) => {
const onlineUserIds = [...userSocketMap.keys()];

const visibleUsers = [];

for (const targetUserId of onlineUserIds) {
const targetUser = await User.findById(targetUserId).select(
"onlinePrivacy"
);

if (!targetUser) {
continue;
}

const canSee = await canSeePresence(
viewerId,
targetUserId,
targetUser.onlinePrivacy
);

if (canSee) {
visibleUsers.push(targetUserId);
}
}

return visibleUsers;
};

const emitOnlineUsers = async () => {
for (const [viewerId, sockets] of userSocketMap.entries()) {
const visibleUsers = await getVisibleOnlineUsers(viewerId);

for (const socketId of sockets) {
io.to(socketId).emit("getOnlineUsers", visibleUsers);
}
}
};

io.on("connection", async (socket) => {
console.log("User connected:", socket.id);

const userId = socket.handshake.query.userId;

if (userId && userId !== "undefined") {
if (!userSocketMap.has(userId)) {
userSocketMap.set(userId, new Set());
}

userSocketMap.get(userId).add(socket.id);
}

await emitOnlineUsers();

if (userId && userId !== "undefined") {
try {
const pendingMessages = await Message.find({
receiverId: userId,
status: "sent",
});

if (pendingMessages.length > 0) {
await Message.updateMany(
{
receiverId: userId,
status: "sent",
},
{
$set: {
status: "delivered",
},
}
);

for (const message of pendingMessages) {
io.emit("messageDelivered", {
messageId: message._id,
});
}
}
} catch (error) {
console.log(
"Error updating pending messages:",
error.message
);
}
}

socket.on("typing", ({ receiverId }) => {
const receiverSocketId = getReceiverSocketId(receiverId);

if (receiverSocketId) {
io.to(receiverSocketId).emit("userTyping", {
senderId: userId,
});
}
});

socket.on("stopTyping", ({ receiverId }) => {
const receiverSocketId = getReceiverSocketId(receiverId);

if (receiverSocketId) {
io.to(receiverSocketId).emit("userStoppedTyping", {
senderId: userId,
});
}
});

socket.on("disconnect", async () => {
console.log("User disconnected:", socket.id);

if (userId && userId !== "undefined") {
const sockets = userSocketMap.get(userId);

if (sockets) {
sockets.delete(socket.id);

if (sockets.size === 0) {
userSocketMap.delete(userId);

const lastSeen = new Date();

try {
await User.findByIdAndUpdate(userId, {
lastSeen,
});

for (const [
viewerId,
viewerSockets,
] of userSocketMap.entries()) {
const targetUser = await User.findById(
userId
).select("lastSeenPrivacy");

if (!targetUser) {
continue;
}

const canSee = await canSeePresence(
viewerId,
userId,
targetUser.lastSeenPrivacy
);

if (canSee) {
for (const socketId of viewerSockets) {
io.to(socketId).emit("userLastSeen", {
userId,
lastSeen,
});
}
}
}
} catch (error) {
console.log(
"Error updating last seen:",
error.message
);
}
}
}
}

await emitOnlineUsers();
});
});

export { app, io, server };