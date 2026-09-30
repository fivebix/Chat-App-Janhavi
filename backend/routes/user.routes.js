import express from "express";

import protectRoute from "../middleware/protectRoute.js";

import profileUpload from "../middleware/profileUpload.middleware.js";

import {
getUsersForSidebar,
getArchivedConversations,
searchUsers,
updateProfile,
updateProfilePicture,
changePassword,
getSecurityNotifications,
updateSecurityNotifications,
getAccountInfoRequest,
requestAccountInfo,
downloadAccountInfo,
archiveConversation,
pinConversation,
lockConversation,
deleteAccount,
getLastSeenPrivacy,
updateLastSeenPrivacy,
getProfilePicturePrivacy,
updateProfilePicturePrivacy,
getChatLockStatus,
setChatLockPassword,
verifyChatLockPassword,
getLockedConversations,
muteConversation,
favoriteConversation,
addConversationToList,
blockUser,
clearChat,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get(
"/",
protectRoute,
getUsersForSidebar
);

router.get(
"/archived",
protectRoute,
getArchivedConversations
);

router.get(
"/search",
protectRoute,
searchUsers
);

router.put(
"/profile",
protectRoute,
updateProfile
);

router.get(
"/security-notifications",
protectRoute,
getSecurityNotifications
);

router.put(
"/security-notifications",
protectRoute,
updateSecurityNotifications
);

router.get(
"/account-info-request",
protectRoute,
getAccountInfoRequest
);

router.post(
"/account-info-request",
protectRoute,
requestAccountInfo
);

router.get(
"/account-info-request/download",
protectRoute,
downloadAccountInfo
);

router.put(
"/profile-picture",
protectRoute,
profileUpload.single("profilePic"),
updateProfilePicture
);

router.put(
"/change-password",
protectRoute,
changePassword
);

router.delete(
"/account",
protectRoute,
deleteAccount
);

router.put(
"/conversations/:conversationId/archive",
protectRoute,
archiveConversation
);

router.put(
"/conversations/:conversationId/pin",
protectRoute,
pinConversation
);

router.put(
"/conversations/:conversationId/lock",
protectRoute,
lockConversation
);

router.get(
"/last-seen-privacy",
protectRoute,
getLastSeenPrivacy
);

router.put(
"/last-seen-privacy",
protectRoute,
updateLastSeenPrivacy
);

router.get(
"/profile-picture-privacy",
protectRoute,
getProfilePicturePrivacy
);

router.put(
"/profile-picture-privacy",
protectRoute,
updateProfilePicturePrivacy
);

router.get(
"/chat-lock/status",
protectRoute,
getChatLockStatus
);

router.post(
"/chat-lock/password",
protectRoute,
setChatLockPassword
);

router.post(
"/chat-lock/verify",
protectRoute,
verifyChatLockPassword
);

router.get(
"/locked",
protectRoute,
getLockedConversations
);

router.put(
"/conversations/:conversationId/mute",
protectRoute,
muteConversation
);

router.put(
"/conversations/:conversationId/favorite",
protectRoute,
favoriteConversation
);

router.put(
"/conversations/:conversationId/list",
protectRoute,
addConversationToList
);

router.put(
"/block/:userId",
protectRoute,
blockUser
);

router.delete(
"/conversations/:conversationId/clear",
protectRoute,
clearChat
);

export default router;