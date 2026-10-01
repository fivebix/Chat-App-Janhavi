import { Readable } from "stream";

import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

import cloudinary from "../config/cloudinary.js";

import {
getReceiverSocketId,
io,
} from "../socket/socket.js";

const uploadToCloudinary = (
file,
messageType
) =>
new Promise((resolve, reject) => {
const resourceType =
messageType === "file"
? "raw"
: "image";

const uploadStream =
cloudinary.uploader.upload_stream(
{
folder: "chat-app/messages",
resource_type: resourceType,
},
(error, result) => {
if (error) {
reject(error);
} else {
resolve(result);
}
}
);

Readable.from([file.buffer]).pipe(
uploadStream
);
});


export const sendMessage = async (req, res) => {
try {
console.log(
"SEND MESSAGE CONTROLLER HIT"
);

const {
message = "",
replyTo,
gifUrl,
messageType: requestedMessageType,
} = req.body;

const {
id: receiverId,
} = req.params;

const senderId = req.user._id;

const sender = await User.findById(
senderId
).select("blockedUsers");

if (!sender) {
return res.status(404).json({
error: "Sender not found",
});
}

const isBlocked =
sender.blockedUsers?.some(
(userId) =>
String(userId) ===
String(receiverId)
);

if (isBlocked) {
return res.status(403).json({
error:
"You have blocked this user",
});
}

const receiver =
await User.findById(
receiverId
).select("blockedUsers");

if (!receiver) {
return res.status(404).json({
error: "Receiver not found",
});
}

const receiverHasBlockedSender =
receiver.blockedUsers?.some(
(userId) =>
String(userId) ===
String(senderId)
);

if (receiverHasBlockedSender) {
	return res.status(403).json({
		error:
			"You cannot send messages to this user because they have blocked you",
	});
}

console.log("BODY:", {
message,
replyTo,
gifUrl,
requestedMessageType,
receiverId,
senderId,
});

console.log(
"HAS FILE:",
!!req.file
);

let messageType = "text";
let fileUrl = null;
let fileName = null;
let fileType = null;

// GIPHY GIF
if (
requestedMessageType === "gif" &&
typeof gifUrl === "string" &&
gifUrl.trim()
) {
const isValidGifUrl =
/^https:\/\/([a-z0-9-]+\.)?giphy\.com\//i.test(
gifUrl.trim()
);

if (!isValidGifUrl) {
return res.status(400).json({
error: "Invalid GIF URL",
});
}

messageType = "gif";
fileUrl = gifUrl.trim();
fileType = "image/gif";
fileName = "GIF";
}

// Uploaded file/image/GIF
else if (req.file) {
console.log("FILE INFO:", {
name: req.file.originalname,
type: req.file.mimetype,
size: req.file.size,
});

fileName =
req.file.originalname;

fileType =
req.file.mimetype;

if (
req.file.mimetype.startsWith(
"image/"
)
) {
messageType =
req.file.mimetype ===
"image/gif"
? "gif"
: "image";
} else {
messageType = "file";
}

console.log(
"UPLOADING TO CLOUDINARY:",
messageType
);

const result =
await uploadToCloudinary(
req.file,
messageType
);

console.log(
"CLOUDINARY UPLOAD COMPLETE"
);

fileUrl =
result.secure_url;
}

// Validate text, file, or GIF message
if (
!message.trim() &&
!req.file &&
messageType !== "gif"
) {
return res.status(400).json({
error:
"Message cannot be empty",
});
}

if (
messageType !== "text" &&
!fileUrl
) {
return res.status(400).json({
error:
"Attachment is required",
});
}

console.log(
"BEFORE CONVERSATION QUERY"
);

let conversation =
await Conversation.findOne({
participants: {
$all: [
senderId,
receiverId,
],
},
});

console.log(
"CONVERSATION QUERY COMPLETE"
);

if (!conversation) {
conversation =
await Conversation.create({
participants: [
senderId,
receiverId,
],
});
}

const newMessage =
new Message({
senderId,
receiverId,
message:
messageType === "text"
? message.trim()
: "",
messageType,
fileUrl,
fileName,
fileType,
replyTo:
replyTo || null,
status: "sent",
});

conversation.messages.push(
newMessage._id
);

await Promise.all([
conversation.save(),
newMessage.save(),
]);

const receiverSocketId =
getReceiverSocketId(
receiverId
);

if (receiverSocketId) {
newMessage.status =
"delivered";

await newMessage.save();
}

if (newMessage.replyTo) {
await newMessage.populate({
path: "replyTo",
select:
"message senderId receiverId createdAt messageType fileUrl fileName",
});
}

const senderSocketId =
getReceiverSocketId(
senderId.toString()
);

if (receiverSocketId) {
io.to(
receiverSocketId
).emit(
"newMessage",
newMessage.toObject()
);

io.to(
receiverSocketId
).emit(
"conversationActivity",
{
userId:
senderId.toString(),
}
);

io.emit(
"messageDelivered",
{
messageId:
newMessage._id,
}
);
}

if (senderSocketId) {
io.to(
senderSocketId
).emit(
"conversationActivity",
{
userId:
receiverId.toString(),
}
);
}

res.status(201).json(
newMessage
);
} catch (error) {
console.log(
"Error in sendMessage controller:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};


export const getMessages = async (
req,
res
) => {
try {
const {
id: userToChatId,
} = req.params;

const senderId =
req.user._id;

const conversation =
await Conversation.findOne({
participants: {
$all: [
senderId,
userToChatId,
],
},
}).populate({
path: "messages",
populate: {
path: "replyTo",
select:
"message senderId receiverId createdAt messageType fileUrl fileName",
},
});

if (!conversation) {
return res
.status(200)
.json([]);
}

const messages =
conversation.messages;

res.status(200).json(
messages
);
} catch (error) {
console.log(
"Error in getMessages controller:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const markMessagesAsRead = async (
req,
res
) => {
try {
const {
id: senderId,
} = req.params;

const receiverId =
req.user._id;

const messages =
await Message.find({
senderId,
receiverId,
status: {
$ne: "read",
},
}).select("_id");

if (messages.length === 0) {
return res.status(200).json({
message:
"No unread messages",
updatedCount: 0,
});
}

await Message.updateMany(
{
senderId,
receiverId,
status: {
$ne: "read",
},
},
{
$set: {
status: "read",
},
}
);

const senderSocketId =
getReceiverSocketId(
senderId
);

if (senderSocketId) {
io.to(
senderSocketId
).emit(
"messageRead",
{
messageIds:
messages.map(
(message) =>
message._id
),
}
);
}

res.status(200).json({
message:
"Messages marked as read",
updatedCount:
messages.length,
});
} catch (error) {
console.log(
"Error in markMessagesAsRead:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const editMessage = async (
req,
res
) => {
try {
const {
id: messageId,
} = req.params;

const userId =
req.user._id;

const message =
typeof req.body.message ===
"string"
? req.body.message.trim()
: "";

const removeAttachment =
req.body.removeAttachment ===
"true";

const existingMessage =
await Message.findById(
messageId
);

if (!existingMessage) {
return res.status(404).json({
error: "Message not found",
});
}

if (
existingMessage.senderId.toString() !==
userId.toString()
) {
return res.status(403).json({
error:
"You can only edit your own messages",
});
}

if (req.file) {
let messageType;

if (
req.file.mimetype.startsWith(
"image/"
)
) {
messageType =
req.file.mimetype ===
"image/gif"
? "gif"
: "image";
} else {
messageType = "file";
}

const result =
await uploadToCloudinary(
req.file,
messageType
);

existingMessage.fileUrl =
result.secure_url;

existingMessage.fileName =
req.file.originalname;

existingMessage.fileType =
req.file.mimetype;

existingMessage.messageType =
messageType;
} else if (removeAttachment) {
existingMessage.fileUrl =
null;

existingMessage.fileName =
null;

existingMessage.fileType =
null;

existingMessage.messageType =
"text";
}

if (
existingMessage.messageType ===
"text" &&
!message
) {
return res.status(400).json({
error:
"Message cannot be empty",
});
}

existingMessage.message =
message;

existingMessage.edited =
true;

await existingMessage.save();

if (existingMessage.replyTo) {
await existingMessage.populate({
path: "replyTo",
select:
"message senderId receiverId createdAt messageType fileUrl fileName",
});
}

const updatedMessage =
existingMessage.toObject();

const receiverSocketId =
getReceiverSocketId(
existingMessage.receiverId.toString()
);

if (receiverSocketId) {
io.to(
receiverSocketId
).emit(
"messageEdited",
{
message:
updatedMessage,
}
);
}

res.status(200).json(
updatedMessage
);
} catch (error) {
console.log(
"Error in editMessage controller:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const deleteMessage = async (
req,
res
) => {
try {
const {
id: messageId,
} = req.params;

const userId =
req.user._id;

const message =
await Message.findById(
messageId
);

if (!message) {
return res.status(404).json({
error: "Message not found",
});
}

if (
message.senderId.toString() !==
userId.toString()
) {
return res.status(403).json({
error:
"You can only delete your own messages",
});
}

await Conversation.updateOne(
{
messages: messageId,
},
{
$pull: {
messages: messageId,
},
}
);

await Message.findByIdAndDelete(
messageId
);

const receiverSocketId =
getReceiverSocketId(
message.receiverId.toString()
);

if (receiverSocketId) {
io.to(
receiverSocketId
).emit(
"messageDeleted",
{
messageId,
}
);
}

res.status(200).json({
message:
"Message deleted successfully",
messageId,
});
} catch (error) {
console.log(
"Error in deleteMessage controller:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};