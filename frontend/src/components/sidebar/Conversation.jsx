import "../../style/Conversation.css";

import { FaThumbtack } from "react-icons/fa";

import {
FiArchive,
FiCheck,
FiChevronDown,
FiChevronRight,
FiClock,
FiEye,
FiEyeOff,
FiHeart,
FiLock,
FiPaperclip,
FiTrash2,
FiUserX,
FiVolume2,
FiVolumeX,
FiXCircle,
} from "react-icons/fi";

import {
useEffect,
useLayoutEffect,
useRef,
useState,
} from "react";

import { createPortal } from "react-dom";

import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({
conversation,
lastIdx,
}) => {
const {
selectedConversation,
setSelectedConversation,
clearUnreadCount,
setUnreadCount,
} = useConversation();

const unreadCount =
useConversation.getState().unreadCounts[
conversation?._id
] || 0;

const {
onlineUsers,
lastSeenUsers,
} = useSocketContext();

const [isMenuOpen, setIsMenuOpen] = useState(false);
const [showMuteMenu, setShowMuteMenu] = useState(false);
const [showListMenu, setShowListMenu] = useState(false);

const [menuPosition, setMenuPosition] = useState({
left: 0,
top: 0,
});

const [openUpward, setOpenUpward] = useState(false);

const menuButtonRef = useRef(null);
const menuRef = useRef(null);

const [isMuted, setIsMuted] = useState(
conversation?.isMuted || false
);

const [muteExpiresAt, setMuteExpiresAt] = useState(
conversation?.muteExpiresAt || null
);

const [isLocked, setIsLocked] = useState(
conversation?.isLocked || false
);

const [isPinned, setIsPinned] = useState(
conversation?.isPinned || false
);

const [isFavorite, setIsFavorite] = useState(
conversation?.isFavorite || false
);

const [isArchived, setIsArchived] = useState(
conversation?.isArchived || false
);

const [isBlocked, setIsBlocked] = useState(
conversation?.isBlocked || false
);

const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);

const [showPasswordModal, setShowPasswordModal] =
useState(false);

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] =
useState("");

const [showPassword, setShowPassword] =
useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

const [passwordLoading, setPasswordLoading] =
useState(false);

const [passwordError, setPasswordError] =
useState("");

const [showVerifyPasswordModal, setShowVerifyPasswordModal] =
useState(false);

const [verifyPasswordMode, setVerifyPasswordMode] =
useState("open");

const [verifyPassword, setVerifyPassword] =
useState("");

const [showVerifyPassword, setShowVerifyPassword] =
useState(false);

const [verifyPasswordError, setVerifyPasswordError] =
useState("");

const [verifyPasswordLoading, setVerifyPasswordLoading] =
useState(false);

if (!conversation) return null;

const isSelected =
selectedConversation?._id === conversation._id;

const isOnline =
onlineUsers.includes(conversation._id);

const lastSeenPrivacy =
conversation.lastSeenPrivacy || "everyone";

const canShowLastSeen =
lastSeenPrivacy === "everyone" ||
lastSeenPrivacy === "contacts";

const hasVisibleLastSeen =
Object.prototype.hasOwnProperty.call(
lastSeenUsers,
conversation._id
);

const lastSeen =
canShowLastSeen
? hasVisibleLastSeen
? lastSeenUsers[conversation._id]
: conversation.lastSeen
: null;

const formatLastSeen = (date) => {
if (!date) {
return null;
}

const lastSeenDate = new Date(date);
const now = new Date();

const diffInSeconds = Math.floor(
(now - lastSeenDate) / 1000
);

if (diffInSeconds < 60) {
return "Last seen just now";
}

const diffInMinutes = Math.floor(
diffInSeconds / 60
);

if (diffInMinutes < 60) {
return `Last seen ${diffInMinutes}m ago`;
}

const diffInHours = Math.floor(
diffInMinutes / 60
);

if (diffInHours < 24) {
return `Last seen ${diffInHours}h ago`;
}

const diffInDays = Math.floor(
diffInHours / 24
);

if (diffInDays < 7) {
return `Last seen ${diffInDays}d ago`;
}

return `Last seen ${lastSeenDate.toLocaleDateString()}`;
};

const lastSeenText = formatLastSeen(lastSeen);

const lastMessagePreview =
conversation.lastMessagePreview || "";

const lastMessageTime =
conversation.lastMessageTime || "";

const handleConversationClick = () => {
if (isMenuOpen) return;

if (isLocked) {
setVerifyPasswordMode("open");
setVerifyPassword("");
setVerifyPasswordError("");
setShowVerifyPassword(false);
setShowVerifyPasswordModal(true);
return;
}

clearUnreadCount(conversation._id);
setSelectedConversation(conversation);
};

const handleMenuToggle = (event) => {
event.stopPropagation();

if (isMenuOpen) {
setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);
return;
}

setShowMuteMenu(false);
setShowListMenu(false);
setIsMenuOpen(true);

window.dispatchEvent(
new CustomEvent("conversation-menu-open", {
detail: conversation._id,
})
);
};

useLayoutEffect(() => {
if (!isMenuOpen) return;

const updateMenuPosition = () => {
if (
!menuButtonRef.current ||
!menuRef.current
) {
return;
}

const buttonRect =
menuButtonRef.current.getBoundingClientRect();

const menuRect =
menuRef.current.getBoundingClientRect();

const gap = 8;
const padding = 12;

const viewportHeight = window.innerHeight;
const viewportWidth = window.innerWidth;

const spaceBelow =
viewportHeight -
buttonRect.bottom -
padding;

const spaceAbove =
buttonRect.top -
padding;

const shouldOpenUp =
spaceBelow < menuRect.height &&
spaceAbove > spaceBelow;

let left = buttonRect.right + gap;

if (
left + menuRect.width >
viewportWidth - padding
) {
left =
buttonRect.right -
menuRect.width;
}

if (left < padding) {
left = padding;
}

let top;

if (shouldOpenUp) {
top =
buttonRect.top -
menuRect.height -
gap;
} else {
top =
buttonRect.bottom +
gap;
}

if (
top + menuRect.height >
viewportHeight - padding
) {
top =
viewportHeight -
menuRect.height -
padding;
}

if (top < padding) {
top = padding;
}

setMenuPosition({
left,
top,
});

setOpenUpward(shouldOpenUp);
};

requestAnimationFrame(updateMenuPosition);

window.addEventListener(
"resize",
updateMenuPosition
);

window.addEventListener(
"scroll",
updateMenuPosition,
true
);

return () => {
window.removeEventListener(
"resize",
updateMenuPosition
);

window.removeEventListener(
"scroll",
updateMenuPosition,
true
);
};
}, [isMenuOpen]);

useEffect(() => {
const handleOtherMenuOpen = (event) => {
if (
event.detail !== conversation._id
) {
setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);
}
};

const handleOutsideClick = (event) => {
if (
menuRef.current?.contains(
event.target
)
) {
return;
}

if (
menuButtonRef.current?.contains(
event.target
)
) {
return;
}

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);
};

const handleEscape = (event) => {
if (event.key === "Escape") {
setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);
}
};

window.addEventListener(
"conversation-menu-open",
handleOtherMenuOpen
);

document.addEventListener(
"mousedown",
handleOutsideClick
);

document.addEventListener(
"keydown",
handleEscape
);

return () => {
window.removeEventListener(
"conversation-menu-open",
handleOtherMenuOpen
);

document.removeEventListener(
"mousedown",
handleOutsideClick
);

document.removeEventListener(
"keydown",
handleEscape
);
};
}, [conversation._id]);

const handleArchive = async (event) => {
event.stopPropagation();

if (!conversation.conversationId) {
console.error(
"Cannot archive: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/archive`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to archive chat"
);
}

setIsArchived(data.isArchived);

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

if (data.isArchived) {
if (
selectedConversation?._id ===
conversation._id
) {
setSelectedConversation(null);
}

window.dispatchEvent(
new CustomEvent(
"conversation-archived",
{
detail:
conversation._id,
}
)
);
} else {
window.dispatchEvent(
new CustomEvent(
"conversation-unarchived",
{
detail:
conversation._id,
}
)
);
}
} catch (error) {
console.error(
"Error archiving conversation:",
error.message
);
}
};

const handleLock = async (event) => {
event.stopPropagation();

if (!conversation.conversationId) {
console.error(
"Cannot lock: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/chat-lock/status`,
{
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to check chat lock status"
);
}

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

if (!data.hasPassword) {
setPassword("");
setConfirmPassword("");
setPasswordError("");
setShowPassword(false);
setShowConfirmPassword(false);
setShowPasswordModal(true);
return;
}

if (isLocked) {
setVerifyPasswordMode("unlock");
setVerifyPassword("");
setVerifyPasswordError("");
setShowVerifyPassword(false);
setShowVerifyPasswordModal(true);
return;
}

const lockResponse = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/lock`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const lockData =
await lockResponse.json();

if (!lockResponse.ok) {
throw new Error(
lockData.error ||
"Failed to lock chat"
);
}

setIsLocked(lockData.isLocked);

if (lockData.isLocked) {
if (
selectedConversation?._id ===
conversation._id
) {
setSelectedConversation(null);
}
}

window.dispatchEvent(
new CustomEvent(
"conversation-locked",
{
detail: {
conversationId:
conversation._id,
isLocked:
lockData.isLocked,
},
}
)
);
} catch (error) {
console.error(
"Error updating chat lock:",
error.message
);
}
};

const handleCreatePassword = async (
event
) => {
event.preventDefault();

if (
!password ||
!confirmPassword
) {
setPasswordError(
"Please enter and confirm your password"
);
return;
}

if (password !== confirmPassword) {
setPasswordError(
"Passwords do not match"
);
return;
}

if (password.length < 4) {
setPasswordError(
"Password must be at least 4 characters long"
);
return;
}

try {
setPasswordLoading(true);
setPasswordError("");

const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/chat-lock/password`,
{
method: "POST",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
password,
confirmPassword,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to create chat lock password"
);
}

setPassword("");
setConfirmPassword("");
setPasswordError("");
setShowPassword(false);
setShowConfirmPassword(false);
setShowPasswordModal(false);

const lockResponse = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/lock`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const lockData =
await lockResponse.json();

if (!lockResponse.ok) {
throw new Error(
lockData.error ||
"Failed to lock chat"
);
}

setIsLocked(lockData.isLocked);

if (lockData.isLocked) {
if (
selectedConversation?._id ===
conversation._id
) {
setSelectedConversation(null);
}
}

window.dispatchEvent(
new CustomEvent(
"conversation-locked",
{
detail: {
conversationId:
conversation._id,
isLocked:
lockData.isLocked,
},
}
)
);
} catch (error) {
console.error(
"Error creating chat lock password:",
error.message
);

setPasswordError(error.message);
} finally {
setPasswordLoading(false);
}
};

const handleVerifyPassword = async (
event
) => {
event.preventDefault();

if (!verifyPassword) {
setVerifyPasswordError(
"Please enter your password"
);
return;
}

try {
setVerifyPasswordLoading(true);
setVerifyPasswordError("");

const token =
localStorage.getItem("chat-token");

if (
verifyPasswordMode ===
"unlock"
) {
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/lock`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
password:
verifyPassword,
}),
}
);

const data =
await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Incorrect password"
);
}

setIsLocked(data.isLocked);

setShowVerifyPasswordModal(
false
);
setVerifyPassword("");
setVerifyPasswordError("");
setShowVerifyPassword(false);

window.dispatchEvent(
new CustomEvent(
"conversation-locked",
{
detail: {
conversationId:
conversation._id,
isLocked:
data.isLocked,
},
}
)
);

return;
}

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/chat-lock/verify`,
{
method: "POST",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
password:
verifyPassword,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Incorrect password"
);
}

setShowVerifyPasswordModal(
false
);
setVerifyPassword("");
setVerifyPasswordError("");
setShowVerifyPassword(false);

clearUnreadCount(
conversation._id
);

setSelectedConversation(
conversation
);
} catch (error) {
setVerifyPasswordError(
error.message
);
} finally {
setVerifyPasswordLoading(false);
}
};

const handleMute = async (duration) => {
if (!conversation.conversationId) {
console.error(
"Cannot mute: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/mute`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
duration,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update mute settings"
);
}

setIsMuted(data.isMuted);
setMuteExpiresAt(data.expiresAt);

setShowMuteMenu(false);
setIsMenuOpen(false);

window.dispatchEvent(
new CustomEvent(
"conversation-muted",
{
detail: {
conversationId:
conversation._id,
isMuted:
data.isMuted,
muteExpiresAt:
data.expiresAt,
},
}
)
);
} catch (error) {
console.error(
"Error updating mute settings:",
error.message
);
}
};

const handlePin = async (event) => {
event.stopPropagation();

if (!conversation.conversationId) {
console.error(
"Cannot pin: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/pin`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to pin chat"
);
}

setIsPinned(data.isPinned);

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

window.dispatchEvent(
new CustomEvent(
"conversation-pinned",
{
detail: {
conversationId:
conversation._id,
isPinned:
data.isPinned,
},
}
)
);
} catch (error) {
console.error(
"Error pinning conversation:",
error.message
);
}
};

const handleMarkUnread = (event) => {
event.stopPropagation();

const newUnreadCount = Math.max(unreadCount, 1);

setUnreadCount(
conversation._id,
newUnreadCount
);

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

window.dispatchEvent(
new CustomEvent("conversation-marked-unread", {
detail: {
conversationId: conversation._id,
unreadCount: newUnreadCount,
},
})
);
};


const handleFavorite = async (event) => {
event.stopPropagation();

if (!conversation.conversationId) {
console.error(
"Cannot favorite: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/favorite`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update favorite"
);
}

setIsFavorite(data.isFavorite);

setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

window.dispatchEvent(
new CustomEvent(
"conversation-favorite-updated",
{
detail: {
conversationId:
conversation._id,
isFavorite:
data.isFavorite,
},
}
)
);
} catch (error) {
console.error(
"Error updating favorite:",
error.message
);
}
};

const handleBlock = async (event) => {
event.stopPropagation();

if (!conversation?._id) {
console.error("Cannot block: user ID is missing");
return;
}

try {
const token = localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/block/${conversation._id}`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error || "Failed to update block status"
);
}

setIsBlocked(data.isBlocked);

		setSelectedConversation({ ...conversation, isBlocked: data.isBlocked });

		setIsMenuOpen(false);
setShowMuteMenu(false);
setShowListMenu(false);

window.dispatchEvent(
new CustomEvent("conversation-blocked", {
detail: {
userId: conversation._id,
isBlocked: data.isBlocked,
},
})
);
} catch (error) {
console.error(
"Error updating block status:",
error.message
);
}
};



const handleClearChat = (event) => {
	event.stopPropagation();

	setIsMenuOpen(false);
	setShowMuteMenu(false);
	setShowListMenu(false);
	setShowClearChatConfirm(true);
};

const confirmClearChat = async () => {
	if (!conversation?.conversationId) {
		console.error("Cannot clear chat: conversationId is missing");
		return;
	}

	try {
		const token = localStorage.getItem("chat-token");
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/clear`,
			{ method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
		);
		const data = await response.json();
		if (!response.ok) throw new Error(data.error || "Failed to clear chat");
		setShowClearChatConfirm(false);
		window.dispatchEvent(new CustomEvent("conversation-cleared", { detail: { conversationId: conversation._id } }));
	} catch (error) {
		console.error("Error clearing chat:", error.message);
	}
};

const handleDeleteChat = (event) => {
event.stopPropagation();

setIsMenuOpen(false);
};

const handleListOption = async (event) => {
event.stopPropagation();

const listName = event.currentTarget
.querySelector("span")
?.textContent;

if (!listName) {
return;
}

if (!conversation.conversationId) {
console.error(
"Cannot update list: conversationId is missing"
);
return;
}

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/conversations/${conversation.conversationId}/list`,
{
method: "PUT",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
listName,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update conversation list"
);
}

setShowListMenu(false);
setIsMenuOpen(false);

window.dispatchEvent(
new CustomEvent(
"conversation-list-updated",
{
detail: {
conversationId:
conversation._id,
listName,
isAdded: data.isAdded,
},
}
)
);
} catch (error) {
console.error(
"Error updating conversation list:",
error.message
);
}
};

const renderPasswordModal = () => {
if (!showPasswordModal) return null;

return createPortal(
<div
className="chat-lock-modal-overlay"
onClick={() =>
!passwordLoading &&
setShowPasswordModal(false)
}
>
<div
className="chat-lock-modal"
onClick={(event) =>
event.stopPropagation()
}
>
<div className="chat-lock-modal-icon">
<FiLock />
</div>

<h3>
Create Chat Lock Password
</h3>

<p>
Create a password to protect
your locked chats.
</p>

<form
onSubmit={
handleCreatePassword
}
>
<div className="chat-lock-password-field">
<input
type={
showPassword
? "text"
: "password"
}
value={password}
onChange={(event) =>
setPassword(
event.target.value
)
}
placeholder="Enter password"
autoFocus
disabled={
passwordLoading
}
/>

<button
type="button"
className="chat-lock-password-toggle"
onClick={() =>
setShowPassword(
(current) =>
!current
)
}
disabled={
passwordLoading
}
aria-label={
showPassword
? "Hide password"
: "Show password"
}
>
{showPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

<div className="chat-lock-password-field">
<input
type={
showConfirmPassword
? "text"
: "password"
}
value={
confirmPassword
}
onChange={(event) =>
setConfirmPassword(
event.target.value
)
}
placeholder="Confirm password"
disabled={
passwordLoading
}
/>

<button
type="button"
className="chat-lock-password-toggle"
onClick={() =>
setShowConfirmPassword(
(current) =>
!current
)
}
disabled={
passwordLoading
}
aria-label={
showConfirmPassword
? "Hide password"
: "Show password"
}
>
{showConfirmPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

{passwordError && (
<p className="chat-lock-error">
{passwordError}
</p>
)}

<div className="chat-lock-modal-actions">
<button
type="button"
className="chat-lock-cancel"
onClick={() => {
setShowPasswordModal(
false
);
setShowPassword(
false
);
setShowConfirmPassword(
false
);
}}
disabled={
passwordLoading
}
>
Cancel
</button>

<button
type="submit"
className="chat-lock-save"
disabled={
passwordLoading
}
>
{passwordLoading
? "Creating..."
: "Create Password"}
</button>
</div>
</form>
</div>
</div>,
document.body
);
};

const renderVerifyPasswordModal = () => {
if (!showVerifyPasswordModal) {
return null;
}

return createPortal(
<div
className="chat-lock-modal-overlay"
onClick={() => {
if (!verifyPasswordLoading) {
setShowVerifyPasswordModal(
false
);
setShowVerifyPassword(
false
);
}
}}
>
<div
className="chat-lock-modal"
onClick={(event) =>
event.stopPropagation()
}
>
<div className="chat-lock-modal-icon">
<FiLock />
</div>

<h3>Locked Chat</h3>

<p>
{verifyPasswordMode ===
"unlock"
? "Enter your chat lock password to unlock this conversation."
: "Enter your chat lock password to open this conversation."}
</p>

<form
onSubmit={
handleVerifyPassword
}
>
<div className="chat-lock-password-field">
<input
type={
showVerifyPassword
? "text"
: "password"
}
value={
verifyPassword
}
onChange={(event) =>
setVerifyPassword(
event.target.value
)
}
placeholder="Enter password"
autoFocus
disabled={
verifyPasswordLoading
}
/>

<button
type="button"
className="chat-lock-password-toggle"
onClick={() =>
setShowVerifyPassword(
(current) =>
!current
)
}
disabled={
verifyPasswordLoading
}
aria-label={
showVerifyPassword
? "Hide password"
: "Show password"
}
>
{showVerifyPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

{verifyPasswordError && (
<p className="chat-lock-error">
{
verifyPasswordError
}
</p>
)}

<div className="chat-lock-modal-actions">
<button
type="button"
className="chat-lock-cancel"
onClick={() => {
setShowVerifyPasswordModal(
false
);
setVerifyPassword(
""
);
setVerifyPasswordError(
""
);
setShowVerifyPassword(
false
);
}}
disabled={
verifyPasswordLoading
}
>
Cancel
</button>

<button
type="submit"
className="chat-lock-save"
disabled={
verifyPasswordLoading
}
>
{verifyPasswordLoading
? "Verifying..."
: verifyPasswordMode ===
"unlock"
? "Unlock Chat"
: "Open Chat"}
</button>
</div>
</form>
</div>
</div>,
document.body
);
};

const renderClearChatToast = () => {
	if (!showClearChatConfirm) return null;
	return createPortal(
		<div className="clear-chat-toast-overlay" onClick={() => setShowClearChatConfirm(false)}>
			<div className="clear-chat-toast" onClick={(event) => event.stopPropagation()}>
				<div className="clear-chat-toast-content">
					<h3>Clear this chat?</h3>
					<p>This will delete all messages from this conversation.</p>
				</div>
				<div className="clear-chat-toast-actions">
					<button type="button" className="clear-chat-cancel" onClick={() => setShowClearChatConfirm(false)}>Cancel</button>
					<button type="button" className="clear-chat-confirm" onClick={confirmClearChat}>Clear chat</button>
				</div>
			</div>
		</div>,
		document.body
	);
};

const renderMenu = () => {
if (!isMenuOpen) return null;

return createPortal(
<div
ref={menuRef}
className={`conversation-menu ${
openUpward
? "menu-open-up"
: "menu-open-down"
}`}
style={{
left: `${menuPosition.left}px`,
top: `${menuPosition.top}px`,
}}
onClick={(event) =>
event.stopPropagation()
}
>
<button
type="button"
className="conversation-menu-item"
onClick={handleArchive}
>
<FiArchive />

<span>
{isArchived
? "Unarchive chat"
: "Archive chat"}
</span>
</button>

<button
type="button"
className="conversation-menu-item"
onClick={handleLock}
>
<FiLock />

<span>
{isLocked
? "Unlock chat"
: "Lock chat"}
</span>
</button>

<div className="conversation-menu-submenu-wrapper">
<button
type="button"
className="conversation-menu-item"
onClick={(event) => {
event.stopPropagation();

if (isMuted) {
handleMute(null);
return;
}

setShowMuteMenu(
(current) =>
!current
);

setShowListMenu(false);
}}
>
{isMuted ? (
<FiVolume2 />
) : (
<FiVolumeX />
)}

<span>
{isMuted
? "Unmute notifications"
: "Mute notifications"}
</span>

{!isMuted && (
<FiChevronRight className="menu-arrow" />
)}
</button>

{showMuteMenu && (
<div className="conversation-submenu">
<button
type="button"
className="conversation-menu-item"
onClick={() =>
handleMute(
"8hours"
)
}
>
<span>
8 hours
</span>
</button>

<button
type="button"
className="conversation-menu-item"
onClick={() =>
handleMute(
"1week"
)
}
>
<span>
1 week
</span>
</button>

<button
type="button"
className="conversation-menu-item"
onClick={() =>
handleMute(
"always"
)
}
>
<span>
Always
</span>
</button>
</div>
)}
</div>

<button
type="button"
className="conversation-menu-item"
onClick={handlePin}
>
<FaThumbtack />

<span>
{isPinned
? "Unpin chat"
: "Pin chat"}
</span>
</button>

<button
type="button"
className="conversation-menu-item"
onClick={handleMarkUnread}
>
<FiCheck />

<span>
Mark as unread
</span>
</button>

<button
type="button"
className="conversation-menu-item"
onClick={handleFavorite}
>
<FiHeart />

<span>
{isFavorite
? "Remove from Favorites"
: "Add to Favorites"}
</span>
</button>

<div className="conversation-menu-submenu-wrapper">
<button
type="button"
className="conversation-menu-item"
onClick={(event) => {
event.stopPropagation();

setShowListMenu(
(current) =>
!current
);

setShowMuteMenu(false);
}}
>
<FiPaperclip />

<span>
Add to list
</span>

<FiChevronRight className="menu-arrow" />
</button>

{showListMenu && (
<div className="conversation-submenu">
<button
type="button"
className="conversation-menu-item"
onClick={handleListOption}
>
<span>Work</span>
{conversation?.lists?.some(
(list) => list.listName === "Work"
) && <FiCheck />}
</button>

<button
type="button"
className="conversation-menu-item"
onClick={handleListOption}
>
<span>Family</span>
{conversation?.lists?.some(
(list) => list.listName === "Family"
) && <FiCheck />}
</button>

<button
type="button"
className="conversation-menu-item"
onClick={handleListOption}
>
<span>Friends</span>
{conversation?.lists?.some(
(list) => list.listName === "Friends"
) && <FiCheck />}
</button>
</div>
)}
</div>

<div className="conversation-menu-divider"></div>

<button
type="button"
className="conversation-menu-item danger"
onClick={handleBlock}
>
<FiUserX />
<span>
{isBlocked ? "Unblock" : "Block"}
</span>
</button>

<button
type="button"
className="conversation-menu-item danger"
onClick={handleClearChat}
>
<FiXCircle />

<span>Clear chat</span>
</button>

<button
type="button"
className="conversation-menu-item danger"
onClick={handleDeleteChat}
>
<FiTrash2 />

<span>Delete chat</span>
</button>
</div>,
document.body
);
};

return (
<>
<div
className={`conversation-card ${
isSelected ? "active" : ""
} ${
isArchived ? "archived" : ""
}`}
onClick={
handleConversationClick
}
>
<div className="conversation-content">
<div className="conversation-avatar-wrapper">
{conversation.profilePic ? (
<img
src={
conversation.profilePic
}
alt={
conversation.fullName
}
className="conversation-avatar"
/>
) : (
<div className="conversation-avatar conversation-avatar-fallback">
{conversation.fullName
?.charAt(0)
?.toUpperCase() ||
"?"}
</div>
)}

{isOnline && (
<span className="status-indicator"></span>
)}
</div>

<div
className={`conversation-details ${
!isOnline &&
!lastSeenText &&
!lastMessagePreview
? "conversation-details-centered"
: ""
}`}
>
<div className="conversation-top-row">
<h4>
{
conversation.fullName
}
</h4>

{lastMessageTime && (
<span className="conversation-time">
{
lastMessageTime
}
</span>
)}
</div>

{(isOnline ||
lastSeenText ||
lastMessagePreview) && (
<div className="conversation-bottom-row">
<div className="conversation-preview">
{isLocked && (
<FiLock className="conversation-meta-icon" />
)}

{isOnline ? (
<span className="conversation-status-online">
Online
</span>
) : lastSeenText ? (
<>
<FiClock className="conversation-meta-icon" />

<span className="conversation-status-offline">
{
lastSeenText
}
</span>
</>
) : null}

{(isOnline ||
lastSeenText) && (
<span className="conversation-preview-separator">
·
</span>
)}

<span className="last-message-preview">
{
lastMessagePreview
}
</span>
</div>

<div className="conversation-meta">
{isMuted && (
<FiVolumeX className="muted-icon" />
)}

{isPinned && (
<FaThumbtack className="conversation-pin-icon" />
)}

{isFavorite && (
<FiHeart className="conversation-favorite-icon" />
)}

{unreadCount > 0 && (
<span className="unread-badge">
{unreadCount >
99
? "99+"
: unreadCount}
</span>
)}

<button
ref={
menuButtonRef
}
type="button"
className="conversation-menu-button"
onClick={
handleMenuToggle
}
aria-label="Chat options"
title="Chat options"
>
<FiChevronDown />
</button>
</div>
</div>
)}
</div>
</div>
</div>

{!lastIdx && (
<div className="conversation-divider"></div>
)}

{renderMenu()}
{renderPasswordModal()}
{renderVerifyPasswordModal()}
{renderClearChatToast()}
</>
);
};

export default Conversation;