import bcrypt from "bcryptjs";
import { Readable } from "stream";
import PDFDocument from "pdfkit";

import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";

const getVisibleProfilePic = (
user,
isContact
) => {
const privacy =
user.profilePicPrivacy || "everyone";

if (privacy === "nobody") {
return "";
}

if (
privacy === "contacts" &&
!isContact
) {
return "";
}

return user.profilePic;
};


export const getUsersForSidebar = async (req, res) => {
try {
const loggedInUserId = req.user._id;

const conversations = await Conversation.find({
participants: loggedInUserId,
})
.sort({ updatedAt: -1 })
.populate({
path: "participants",
select: "-password",
});

const conversationUsers = [];

for (const conversation of conversations) {
const otherUser =
conversation.participants.find(
(participant) =>
participant._id.toString() !==
loggedInUserId.toString()
);

if (!otherUser) {
continue;
}

const isBlocked =
req.user.blockedUsers?.some(
(userId) =>
String(userId) ===
String(otherUser._id)
);

const isBlockedByOtherUser =
otherUser.blockedUsers?.some(
(userId) =>
String(userId) ===
String(loggedInUserId)
);

const isArchived =
conversation.archivedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

if (isArchived) {
continue;
}

const isLocked =
conversation.lockedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

if (isLocked) {
continue;
}

const isPinned =
conversation.pinnedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

const isFavorite =
conversation.favoriteBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

const lists =
conversation.lists
?.filter(
(list) =>
String(list.userId) ===
String(loggedInUserId)
)
.map((list) => ({
listName: list.listName,
})) || [];

const muteData =
conversation.mutedBy?.find(
(mute) =>
mute.userId.toString() ===
loggedInUserId.toString()
);

let isMuted = false;
let muteExpiresAt = null;

if (muteData) {
if (
muteData.expiresAt === null ||
new Date(muteData.expiresAt) >
new Date()
) {
isMuted = true;
muteExpiresAt =
muteData.expiresAt;
} else {
conversation.mutedBy =
conversation.mutedBy.filter(
(mute) =>
mute.userId.toString() !==
loggedInUserId.toString()
);

await conversation.save();
}
}

const unreadCount =
await Message.countDocuments({
senderId: otherUser._id,
receiverId: loggedInUserId,
status: {
$ne: "read",
},
});

const otherUserData =
otherUser.toObject();

otherUserData.profilePic =
getVisibleProfilePic(
otherUser,
true
);

conversationUsers.push({
...otherUserData,
conversationId:
conversation._id.toString(),
conversationUpdatedAt:
conversation.updatedAt,
unreadCount,
isArchived: false,
isPinned,
isFavorite,
isMuted,
isBlocked,
isBlockedByOtherUser,
lists,
muteExpiresAt,
lastSeenPrivacy:
otherUser.lastSeenPrivacy,
onlinePrivacy:
otherUser.onlinePrivacy,
profilePicPrivacy:
otherUser.profilePicPrivacy,
});
}

conversationUsers.sort((a, b) => {
if (a.isPinned && !b.isPinned) {
return -1;
}

if (!a.isPinned && b.isPinned) {
return 1;
}

return (
new Date(b.conversationUpdatedAt) -
new Date(a.conversationUpdatedAt)
);
});

const conversationUserIds =
conversationUsers.map(
(user) => user._id
);

const blockedUserIds =
req.user.blockedUsers || [];

const usersWithNoConversation =
await User.find({
_id: {
$ne: loggedInUserId,
$nin: [
...conversationUserIds,
...blockedUserIds,
],
},
}).select("-password");

const allUsers = [
...conversationUsers,
...usersWithNoConversation.map(
(user) => {
const userData =
user.toObject();

userData.profilePic =
getVisibleProfilePic(
user,
false
);

const isBlockedByOtherUser =
user.blockedUsers?.some(
(userId) =>
String(userId) ===
String(loggedInUserId)
);

return {
...userData,
unreadCount: 0,
isArchived: false,
isPinned: false,
isFavorite: false,
isMuted: false,
isBlocked: false,
isBlockedByOtherUser,
muteExpiresAt: null,
lists: [],
lastSeenPrivacy:
user.lastSeenPrivacy,
onlinePrivacy:
user.onlinePrivacy,
profilePicPrivacy:
user.profilePicPrivacy,
};
}
),
];

res.status(200).json(allUsers);
} catch (error) {
console.error(
"Error in getUsersForSidebar:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};


export const getArchivedConversations = async (
req,
res
) => {
try {
const loggedInUserId = req.user._id;

const conversations =
await Conversation.find({
participants: loggedInUserId,
archivedBy: loggedInUserId,
})
.sort({ updatedAt: -1 })
.populate({
path: "participants",
select: "-password",
});

const archivedConversations = [];

for (const conversation of conversations) {
const otherUser =
conversation.participants.find(
(participant) =>
participant._id.toString() !==
loggedInUserId.toString()
);

if (!otherUser) {
continue;
}

const unreadCount =
await Message.countDocuments({
senderId: otherUser._id,
receiverId: loggedInUserId,
status: {
$ne: "read",
},
});

const isPinned =
conversation.pinnedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

const isFavorite =
conversation.favoriteBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

const muteData =
conversation.mutedBy?.find(
(mute) =>
mute.userId.toString() ===
loggedInUserId.toString()
);

let isMuted = false;
let muteExpiresAt = null;

if (muteData) {
if (
muteData.expiresAt === null ||
new Date(muteData.expiresAt) >
new Date()
) {
isMuted = true;
muteExpiresAt =
muteData.expiresAt;
} else {
conversation.mutedBy =
conversation.mutedBy.filter(
(mute) =>
mute.userId.toString() !==
loggedInUserId.toString()
);

await conversation.save();
}
}

const otherUserData =
otherUser.toObject();

otherUserData.profilePic =
getVisibleProfilePic(
otherUser,
true
);

archivedConversations.push({
...otherUserData,
conversationId:
conversation._id.toString(),
conversationUpdatedAt:
conversation.updatedAt,
unreadCount,
isArchived: true,
isPinned,
isFavorite,
isMuted,
muteExpiresAt,
lastSeenPrivacy:
otherUser.lastSeenPrivacy,
onlinePrivacy:
otherUser.onlinePrivacy,
profilePicPrivacy:
otherUser.profilePicPrivacy,
});
}

res.status(200).json(
archivedConversations
);
} catch (error) {
console.error(
"Error in getArchivedConversations:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const getLockedConversations = async (
req,
res
) => {
try {
const loggedInUserId = req.user._id;

const conversations =
await Conversation.find({
participants: loggedInUserId,
lockedBy: loggedInUserId,
})
.sort({ updatedAt: -1 })
.populate({
path: "participants",
select: "-password",
});

const lockedConversations = [];

for (const conversation of conversations) {
const otherUser =
conversation.participants.find(
(participant) =>
participant._id.toString() !==
loggedInUserId.toString()
);

if (!otherUser) {
continue;
}

const unreadCount =
await Message.countDocuments({
senderId: otherUser._id,
receiverId: loggedInUserId,
status: {
$ne: "read",
},
});

const isPinned =
conversation.pinnedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

const otherUserData =
otherUser.toObject();

otherUserData.profilePic =
getVisibleProfilePic(
otherUser,
true
);

lockedConversations.push({
...otherUserData,
conversationId:
conversation._id.toString(),
conversationUpdatedAt:
conversation.updatedAt,
unreadCount,
isLocked: true,
isArchived: false,
isPinned,
lastSeenPrivacy:
otherUser.lastSeenPrivacy,
onlinePrivacy:
otherUser.onlinePrivacy,
profilePicPrivacy:
otherUser.profilePicPrivacy,
});
}

res.status(200).json(
lockedConversations
);
} catch (error) {
console.error(
"Error in getLockedConversations:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const archiveConversation = async (
req,
res
) => {
try {
const { conversationId } = req.params;
const loggedInUserId = req.user._id;

const conversation =
await Conversation.findById(
conversationId
);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(participantId) =>
participantId.toString() ===
loggedInUserId.toString()
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant in this conversation",
});
}

const isAlreadyArchived =
conversation.archivedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

if (isAlreadyArchived) {
conversation.archivedBy =
conversation.archivedBy.filter(
(userId) =>
userId.toString() !==
loggedInUserId.toString()
);
} else {
conversation.archivedBy.push(
loggedInUserId
);
}

await conversation.save();

res.status(200).json({
message: isAlreadyArchived
? "Conversation unarchived successfully"
: "Conversation archived successfully",
isArchived: !isAlreadyArchived,
conversationId:
conversation._id,
});
} catch (error) {
console.error(
"Error in archiveConversation:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const pinConversation = async (
req,
res
) => {
try {
const { conversationId } = req.params;
const loggedInUserId = req.user._id;

const conversation =
await Conversation.findById(
conversationId
);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(participantId) =>
participantId.toString() ===
loggedInUserId.toString()
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant in this conversation",
});
}

const isAlreadyPinned =
conversation.pinnedBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

if (isAlreadyPinned) {
conversation.pinnedBy =
conversation.pinnedBy.filter(
(userId) =>
userId.toString() !==
loggedInUserId.toString()
);
} else {
conversation.pinnedBy.push(
loggedInUserId
);
}

await conversation.save();

res.status(200).json({
message: isAlreadyPinned
? "Conversation unpinned successfully"
: "Conversation pinned successfully",
isPinned: !isAlreadyPinned,
conversationId:
conversation._id,
});
} catch (error) {
console.error(
"Error in pinConversation:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const favoriteConversation = async (
req,
res
) => {
try {
const { conversationId } = req.params;
const loggedInUserId = req.user._id;

const conversation =
await Conversation.findById(
conversationId
);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(participantId) =>
participantId.toString() ===
loggedInUserId.toString()
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant in this conversation",
});
}

const isAlreadyFavorite =
conversation.favoriteBy?.some(
(userId) =>
userId.toString() ===
loggedInUserId.toString()
);

if (isAlreadyFavorite) {
conversation.favoriteBy =
conversation.favoriteBy.filter(
(userId) =>
userId.toString() !==
loggedInUserId.toString()
);
} else {
conversation.favoriteBy.push(
loggedInUserId
);
}

await conversation.save();

res.status(200).json({
message: isAlreadyFavorite
? "Conversation removed from favorites"
: "Conversation added to favorites",
isFavorite: !isAlreadyFavorite,
conversationId:
conversation._id,
});
} catch (error) {
console.error(
"Error updating favorite conversation:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const searchUsers = async (req, res) => {
try {
const { query } = req.query;
const loggedInUserId = req.user._id;

if (!query || !query.trim()) {
return res.status(400).json({
error: "Search query is required",
});
}

const users = await User.find({
_id: { $ne: loggedInUserId },
$or: [
{
fullName: {
$regex: query.trim(),
$options: "i",
},
},
{
username: {
$regex: query.trim(),
$options: "i",
},
},
],
})
.select("-password")
.limit(10);

const conversations =
await Conversation.find({
participants: loggedInUserId,
}).select("participants");

const contactIds = new Set();

for (const conversation of conversations) {
for (const participantId of conversation.participants) {
if (
participantId.toString() !==
loggedInUserId.toString()
) {
contactIds.add(
participantId.toString()
);
}
}
}

const filteredUsers = users.map(
(user) => {
const isContact = contactIds.has(
user._id.toString()
);

const userData =
user.toObject();

userData.profilePic =
getVisibleProfilePic(
user,
isContact
);

return userData;
}
);

res.status(200).json(
filteredUsers
);
} catch (error) {
console.error(
"Error in searchUsers:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const updateProfile = async (
req,
res
) => {
try {
const { fullName, username } =
req.body;

if (!fullName || !fullName.trim()) {
return res.status(400).json({
error: "Full name is required",
});
}

if (!username || !username.trim()) {
return res.status(400).json({
error: "Username is required",
});
}

const trimmedFullName =
fullName.trim();

const trimmedUsername =
username.trim().toLowerCase();

if (trimmedFullName.length < 2) {
return res.status(400).json({
error:
"Full name must be at least 2 characters",
});
}

if (trimmedUsername.length < 3) {
return res.status(400).json({
error:
"Username must be at least 3 characters",
});
}

const existingUser =
await User.findOne({
username: trimmedUsername,
_id: {
$ne: req.user._id,
},
});

if (existingUser) {
return res.status(400).json({
error:
"Username is already taken",
});
}

const updatedUser =
await User.findByIdAndUpdate(
req.user._id,
{
fullName:
trimmedFullName,
username:
trimmedUsername,
},
{
new: true,
runValidators: true,
}
).select("-password");

if (!updatedUser) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
message:
"Profile updated successfully",
user: {
_id: updatedUser._id,
fullName:
updatedUser.fullName,
username:
updatedUser.username,
profilePic:
updatedUser.profilePic,
},
});
} catch (error) {
console.error(
"Error in updateProfile:",
error.message
);

if (error.code === 11000) {
return res.status(400).json({
error:
"Username is already taken",
});
}

res.status(500).json({
error: "Internal server error",
});
}
};

export const getSecurityNotifications = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"securityNotifications"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
securityNotifications:
user.securityNotifications,
});
} catch (error) {
console.error(
"Error in getSecurityNotifications:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const updateSecurityNotifications =
async (req, res) => {
try {
const { enabled } =
req.body;

if (
typeof enabled !==
"boolean"
) {
return res.status(400).json({
error:
"Security notifications value must be true or false",
});
}

const updatedUser =
await User.findByIdAndUpdate(
req.user._id,
{
securityNotifications:
enabled,
},
{
new: true,
}
).select(
"securityNotifications"
);

if (!updatedUser) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
message:
"Security notifications updated successfully",
securityNotifications:
updatedUser.securityNotifications,
});
} catch (error) {
console.error(
"Error in updateSecurityNotifications:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const getAccountInfoRequest = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"accountInfoRequest"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
status:
user.accountInfoRequest
.status,
requestedAt:
user.accountInfoRequest
.requestedAt,
readyAt:
user.accountInfoRequest
.readyAt,
});
} catch (error) {
console.error(
"Error in getAccountInfoRequest:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const requestAccountInfo = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

if (
user.accountInfoRequest
.status === "processing"
) {
return res.status(400).json({
error:
"Account information is already being prepared",
status:
user.accountInfoRequest
.status,
requestedAt:
user.accountInfoRequest
.requestedAt,
});
}

if (
user.accountInfoRequest
.status === "ready"
) {
return res.status(400).json({
error:
"Account information is already ready to download",
status:
user.accountInfoRequest
.status,
requestedAt:
user.accountInfoRequest
.requestedAt,
readyAt:
user.accountInfoRequest
.readyAt,
});
}

user.accountInfoRequest.status =
"processing";

user.accountInfoRequest.requestedAt =
new Date();

user.accountInfoRequest.readyAt =
null;

await user.save();

user.accountInfoRequest.status =
"ready";

user.accountInfoRequest.readyAt =
new Date();

await user.save();

res.status(200).json({
message:
"Account information is ready to download",
status:
user.accountInfoRequest.status,
requestedAt:
user.accountInfoRequest
.requestedAt,
readyAt:
user.accountInfoRequest
.readyAt,
});
} catch (error) {
console.error(
"Error in requestAccountInfo:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const downloadAccountInfo = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"_id fullName username gender profilePic createdAt updatedAt accountInfoRequest"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

if (
user.accountInfoRequest?.status !==
"ready"
) {
return res.status(400).json({
error:
"Account information is not ready yet",
});
}

const doc = new PDFDocument({
size: "A4",
margin: 50,
});

res.setHeader(
"Content-Type",
"application/pdf"
);

res.setHeader(
"Content-Disposition",
'attachment; filename="account-information.pdf"'
);

doc.pipe(res);

doc
.fontSize(22)
.font("Helvetica-Bold")
.text("ChatApp", {
align: "center",
});

doc
.moveDown(0.4)
.fontSize(18)
.text("Account Information", {
align: "center",
});

doc.moveDown(1);

doc
.moveTo(50, doc.y)
.lineTo(545, doc.y)
.stroke();

doc.moveDown(1);

const accountDetails = [
[
"Account ID",
user._id.toString(),
],
[
"Full Name",
user.fullName,
],
[
"Username",
`@${user.username}`,
],
[
"Gender",
user.gender,
],
[
"Account Created",
new Date(
user.createdAt
).toLocaleString(),
],
[
"Last Updated",
new Date(
user.updatedAt
).toLocaleString(),
],
[
"Exported On",
new Date().toLocaleString(),
],
];

for (const [
label,
value,
] of accountDetails) {
doc
.fontSize(11)
.font("Helvetica-Bold")
.text(`${label}:`);

doc
.fontSize(11)
.font("Helvetica")
.text(
String(
value ||
"Not available"
)
);

doc.moveDown(0.7);
}

doc.moveDown(1);

doc
.moveTo(50, doc.y)
.lineTo(545, doc.y)
.stroke();

doc.moveDown(1);

doc
.fontSize(10)
.font("Helvetica")
.text(
"This document contains account information associated with your ChatApp account.",
{
align: "center",
}
);

doc.end();
} catch (error) {
console.error(
"Error in downloadAccountInfo:",
error.message
);

if (!res.headersSent) {
res.status(500).json({
error:
"Internal server error",
});
}
}
};

export const updateProfilePicture = async (
req,
res
) => {
try {
if (!req.file) {
return res.status(400).json({
error:
"Profile picture is required",
});
}

const uploadToCloudinary =
() =>
new Promise(
(resolve, reject) => {
const uploadStream =
cloudinary.uploader.upload_stream(
{
folder:
"chat-app/profile-pictures",
resource_type:
"image",
},
(
error,
result
) => {
if (
error
) {
reject(
error
);
} else {
resolve(
result
);
}
}
);

Readable.from(
req.file.buffer
).pipe(
uploadStream
);
}
);

const result =
await uploadToCloudinary();

const updatedUser =
await User.findByIdAndUpdate(
req.user._id,
{
profilePic:
result.secure_url,
},
{
new: true,
}
).select("-password");

if (!updatedUser) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
message:
"Profile picture updated successfully",
user: {
_id: updatedUser._id,
fullName:
updatedUser.fullName,
username:
updatedUser.username,
profilePic:
updatedUser.profilePic,
},
});
} catch (error) {
console.error(
"Error in updateProfilePicture:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const changePassword = async (
req,
res
) => {
try {
const {
currentPassword,
newPassword,
confirmPassword,
} = req.body;

if (
!currentPassword ||
!newPassword ||
!confirmPassword
) {
return res.status(400).json({
error:
"All password fields are required",
});
}

if (
newPassword !==
confirmPassword
) {
return res.status(400).json({
error:
"New passwords don't match",
});
}

if (newPassword.length < 6) {
return res.status(400).json({
error:
"New password must be at least 6 characters",
});
}

const user =
await User.findById(
req.user._id
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

const isPasswordCorrect =
await bcrypt.compare(
currentPassword,
user.password
);

if (!isPasswordCorrect) {
return res.status(400).json({
error:
"Current password is incorrect",
});
}

const isSamePassword =
await bcrypt.compare(
newPassword,
user.password
);

if (isSamePassword) {
return res.status(400).json({
error:
"New password must be different from current password",
});
}

const salt =
await bcrypt.genSalt(10);

const hashedPassword =
await bcrypt.hash(
newPassword,
salt
);

user.password =
hashedPassword;

await user.save();

res.status(200).json({
message:
"Password changed successfully",
});
} catch (error) {
console.error(
"Error in changePassword:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const deleteAccount = async (
req,
res
) => {
try {
const userId = req.user._id;

const user =
await User.findById(userId);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

await Message.deleteMany({
$or: [
{ senderId: userId },
{ receiverId: userId },
],
});

await Conversation.deleteMany({
participants: userId,
});

await User.findByIdAndDelete(
userId
);

res.status(200).json({
message:
"Account deleted successfully",
});
} catch (error) {
console.error(
"Error in deleteAccount:",
error.message
);

res.status(500).json({
error:
"Failed to delete account",
});
}
};

export const getLastSeenPrivacy = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"lastSeenPrivacy onlinePrivacy"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
lastSeenPrivacy:
user.lastSeenPrivacy,
onlinePrivacy:
user.onlinePrivacy,
});
} catch (error) {
console.error(
"Error in getLastSeenPrivacy:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const updateLastSeenPrivacy = async (
req,
res
) => {
try {
const {
lastSeenPrivacy,
onlinePrivacy,
} = req.body;

const allowedValues = [
"everyone",
"contacts",
"nobody",
];

if (
!allowedValues.includes(
lastSeenPrivacy
) ||
!allowedValues.includes(
onlinePrivacy
)
) {
return res.status(400).json({
error:
"Invalid privacy setting",
});
}

const updatedUser =
await User.findByIdAndUpdate(
req.user._id,
{
lastSeenPrivacy,
onlinePrivacy,
},
{
new: true,
runValidators: true,
}
).select(
"lastSeenPrivacy onlinePrivacy"
);

if (!updatedUser) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
message:
"Privacy settings updated successfully",
lastSeenPrivacy:
updatedUser.lastSeenPrivacy,
onlinePrivacy:
updatedUser.onlinePrivacy,
});
} catch (error) {
console.error(
"Error in updateLastSeenPrivacy:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const getProfilePicturePrivacy = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"profilePicPrivacy"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
profilePicPrivacy:
user.profilePicPrivacy,
});
} catch (error) {
console.error(
"Error in getProfilePicturePrivacy:",
error.message
);

res.status(500).json({
error: "Internal server error",
});
}
};

export const updateProfilePicturePrivacy =
async (req, res) => {
try {
const {
profilePicPrivacy,
} = req.body;

const allowedValues = [
"everyone",
"contacts",
"nobody",
];

if (
!allowedValues.includes(
profilePicPrivacy
)
) {
return res.status(400).json({
error:
"Invalid profile picture privacy setting",
});
}

const updatedUser =
await User.findByIdAndUpdate(
req.user._id,
{
profilePicPrivacy,
},
{
new: true,
runValidators: true,
}
).select(
"profilePicPrivacy"
);

if (!updatedUser) {
return res.status(404).json({
error: "User not found",
});
}

res.status(200).json({
message:
"Profile picture privacy updated successfully",
profilePicPrivacy:
updatedUser.profilePicPrivacy,
});
} catch (error) {
console.error(
"Error in updateProfilePicturePrivacy:",
error.message
);

res.status(500).json({
error:
"Internal server error",
});
}
};

export const lockConversation = async (
req,
res
) => {
try {
const userId = req.user._id;
const { conversationId } = req.params;
const { password } = req.body;

const conversation =
await Conversation.findById(
conversationId
);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(participantId) =>
participantId.toString() ===
userId.toString()
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant of this conversation",
});
}

const isLocked =
conversation.lockedBy.some(
(id) =>
id.toString() ===
userId.toString()
);

if (isLocked) {
if (!password) {
return res.status(400).json({
error:
"Password is required to unlock the conversation",
});
}

const user =
await User.findById(
userId
).select(
"chatLockPassword"
);

if (
!user ||
!user.chatLockPassword
) {
return res.status(400).json({
error:
"Chat lock password is not set",
});
}

const isPasswordValid =
await bcrypt.compare(
password,
user.chatLockPassword
);

if (!isPasswordValid) {
return res.status(401).json({
error:
"Incorrect password",
});
}

conversation.lockedBy =
conversation.lockedBy.filter(
(id) =>
id.toString() !==
userId.toString()
);
} else {
conversation.lockedBy.push(
userId
);
}

await conversation.save();

return res.status(200).json({
message: isLocked
? "Conversation unlocked successfully"
: "Conversation locked successfully",
isLocked: !isLocked,
});
} catch (error) {
console.error(
"Lock conversation error:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};

export const getChatLockStatus = async (
req,
res
) => {
try {
const user =
await User.findById(
req.user._id
).select(
"chatLockPassword"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

return res.status(200).json({
hasPassword: Boolean(
user.chatLockPassword
),
});
} catch (error) {
console.error(
"Get chat lock status error:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};

export const setChatLockPassword = async (
req,
res
) => {
try {
const userId = req.user._id;
const {
password,
confirmPassword,
} = req.body;

if (
!password ||
!confirmPassword
) {
return res.status(400).json({
error:
"Password and confirmation are required",
});
}

if (
password !==
confirmPassword
) {
return res.status(400).json({
error:
"Passwords do not match",
});
}

if (password.length < 4) {
return res.status(400).json({
error:
"Password must be at least 4 characters long",
});
}

const user =
await User.findById(userId);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

const hashedPassword =
await bcrypt.hash(
password,
10
);

user.chatLockPassword =
hashedPassword;

await user.save();

return res.status(200).json({
message:
"Chat lock password created successfully",
});
} catch (error) {
console.error(
"Set chat lock password error:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};

export const verifyChatLockPassword = async (
req,
res
) => {
try {
const userId = req.user._id;
const { password } = req.body;

if (!password) {
return res.status(400).json({
error: "Password is required",
});
}

const user =
await User.findById(
userId
).select(
"chatLockPassword"
);

if (!user) {
return res.status(404).json({
error: "User not found",
});
}

if (!user.chatLockPassword) {
return res.status(400).json({
error:
"Chat lock password is not set",
});
}

const isValid =
await bcrypt.compare(
password,
user.chatLockPassword
);

if (!isValid) {
return res.status(401).json({
error: "Incorrect password",
});
}

return res.status(200).json({
message:
"Password verified successfully",
verified: true,
});
} catch (error) {
console.error(
"Verify chat lock password error:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};

export const muteConversation = async (
req,
res
) => {
try {
const userId = req.user._id;
const { conversationId } = req.params;
const { duration } = req.body;

const conversation =
await Conversation.findById(
conversationId
);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(participantId) =>
participantId.toString() ===
userId.toString()
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant of this conversation",
});
}

const existingMuteIndex =
conversation.mutedBy.findIndex(
(mute) =>
mute.userId.toString() ===
userId.toString()
);

if (!duration) {
if (
existingMuteIndex !== -1
) {
conversation.mutedBy.splice(
existingMuteIndex,
1
);
}

await conversation.save();

return res.status(200).json({
message:
"Notifications unmuted successfully",
isMuted: false,
expiresAt: null,
});
}

let expiresAt = null;

if (duration === "8hours") {
expiresAt = new Date(
Date.now() +
8 *
60 *
60 *
1000
);
} else if (
duration === "1week"
) {
expiresAt = new Date(
Date.now() +
7 *
24 *
60 *
60 *
1000
);
} else if (
duration === "always"
) {
expiresAt = null;
} else {
return res.status(400).json({
error:
"Invalid mute duration",
});
}

const muteData = {
userId,
expiresAt,
};

if (existingMuteIndex !== -1) {
conversation.mutedBy[
existingMuteIndex
] = muteData;
} else {
conversation.mutedBy.push(
muteData
);
}

await conversation.save();

return res.status(200).json({
message:
"Notifications muted successfully",
isMuted: true,
expiresAt,
});
} catch (error) {
console.error(
"Error muting conversation:",
error.message
);

return res.status(500).json({
error: "Internal server error",
});
}
};


export const addConversationToList = async (req, res) => {
try {
const { conversationId } = req.params;
const { listName } = req.body;
const userId = req.user._id;

if (!listName) {
return res.status(400).json({
error: "List name is required",
});
}

const conversation =
await Conversation.findById(conversationId);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const existingList = conversation.lists.find(
(list) =>
String(list.userId) === String(userId) &&
list.listName === listName
);

if (existingList) {
conversation.lists =
conversation.lists.filter(
(list) =>
!(
String(list.userId) ===
String(userId) &&
list.listName === listName
)
);

await conversation.save();

return res.status(200).json({
message: `Removed from ${listName}`,
isAdded: false,
listName,
});
}

conversation.lists.push({
userId,
listName,
});

await conversation.save();

return res.status(200).json({
message: `Added to ${listName}`,
isAdded: true,
listName,
});
} catch (error) {
console.error(
"Error updating conversation list:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};


export const blockUser = async (req, res) => {
try {
const { userId } = req.params;
const loggedInUserId = req.user._id;

if (String(userId) === String(loggedInUserId)) {
return res.status(400).json({
error: "You cannot block yourself",
});
}

const userToBlock = await User.findById(userId);

if (!userToBlock) {
return res.status(404).json({
error: "User not found",
});
}

const loggedInUser = await User.findById(loggedInUserId);

const alreadyBlocked = loggedInUser.blockedUsers.some(
(id) => String(id) === String(userId)
);

if (alreadyBlocked) {
loggedInUser.blockedUsers = loggedInUser.blockedUsers.filter(
(id) => String(id) !== String(userId)
);

await loggedInUser.save();

return res.status(200).json({
message: "User unblocked successfully",
isBlocked: false,
});
}

loggedInUser.blockedUsers.push(userId);

await loggedInUser.save();

return res.status(200).json({
message: "User blocked successfully",
isBlocked: true,
});
} catch (error) {
console.error("Error blocking user:", error);

return res.status(500).json({
error: "Internal server error",
});
}
};


export const clearChat = async (req, res) => {
try {
const { conversationId } = req.params;
const loggedInUserId = req.user._id;

const conversation =
await Conversation.findById(conversationId);

if (!conversation) {
return res.status(404).json({
error: "Conversation not found",
});
}

const isParticipant =
conversation.participants.some(
(userId) =>
String(userId) ===
String(loggedInUserId)
);

if (!isParticipant) {
return res.status(403).json({
error:
"You are not a participant in this conversation",
});
}

await Message.deleteMany({
$or: [
{
senderId: loggedInUserId,
receiverId:
conversation.participants.find(
(userId) =>
String(userId) !==
String(loggedInUserId)
),
},
{
senderId:
conversation.participants.find(
(userId) =>
String(userId) !==
String(loggedInUserId)
),
receiverId: loggedInUserId,
},
],
});

conversation.updatedAt = new Date();
await conversation.save();

return res.status(200).json({
message: "Chat cleared successfully",
});
} catch (error) {
console.error(
"Error clearing chat:",
error
);

return res.status(500).json({
error: "Internal server error",
});
}
};