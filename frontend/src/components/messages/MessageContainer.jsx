import "../../style/MessageContainer.css";

import { useEffect, useState } from "react";

import {
TiMessages,
} from "react-icons/ti";

import {
FiSearch,
FiX,
FiArrowLeft,
FiPhone,
FiVideo,
FiMoreVertical,
FiLock,
} from "react-icons/fi";

import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";

import useListenMessages from "../../hooks/useListenMessages";

import MessageInput from "./MessageInput";
import Messages from "./Messages";
import ContactInfo from "./ContactInfo";

const MessageContainer = () => {
const {
selectedConversation,
setSelectedConversation,
} = useConversation();

useListenMessages();

const [searchOpen, setSearchOpen] =
useState(false);

const [searchQuery, setSearchQuery] =
useState("");

const [
selectedSearchMessage,
setSelectedSearchMessage,
] = useState(null);

const [showContactInfo, setShowContactInfo] =
useState(false);

const {
onlineUsers,
lastSeenUsers,
typingUsers,
} = useSocketContext();

useEffect(() => {
return () =>
setSelectedConversation(null);
}, [setSelectedConversation]);

const isOnline = selectedConversation
? onlineUsers.includes(
selectedConversation._id
)
: false;

const isTyping = selectedConversation
? typingUsers.includes(
selectedConversation._id
)
: false;

const lastSeenPrivacy =
selectedConversation?.lastSeenPrivacy ||
"everyone";

const canShowLastSeen =
lastSeenPrivacy === "everyone" ||
(
lastSeenPrivacy === "contacts" &&
Boolean(
selectedConversation?.conversationId
)
);

const hasVisibleLastSeen =
selectedConversation &&
Object.prototype.hasOwnProperty.call(
lastSeenUsers,
selectedConversation._id
);

const lastSeen = selectedConversation && canShowLastSeen
? hasVisibleLastSeen
? lastSeenUsers[selectedConversation._id]
: selectedConversation.lastSeen
: null;

const formatLastSeen = (lastSeen) => {
if (!lastSeen) {
return null;
}

const date = new Date(lastSeen);

const time = date.toLocaleTimeString(
[],
{
hour: "2-digit",
minute: "2-digit",
}
);

const today = new Date();

const isToday =
date.getDate() ===
today.getDate() &&
date.getMonth() ===
today.getMonth() &&
date.getFullYear() ===
today.getFullYear();

if (isToday) {
return `Last seen today at ${time}`;
}

const yesterday = new Date();

yesterday.setDate(
today.getDate() - 1
);

const isYesterday =
date.getDate() ===
yesterday.getDate() &&
date.getMonth() ===
yesterday.getMonth() &&
date.getFullYear() ===
yesterday.getFullYear();

if (isYesterday) {
return `Last seen yesterday at ${time}`;
}

return `Last seen on ${date.toLocaleDateString()} at ${time}`;
};

const lastSeenText =
formatLastSeen(lastSeen);

const handleSearchToggle = () => {
setSearchOpen((prev) => !prev);
setSearchQuery("");
setSelectedSearchMessage(null);
};

const handleContactInfoToggle = () => {
setShowContactInfo((prev) => !prev);
};

const handleContactInfoClose = () => {
setShowContactInfo(false);
};

const handleBack = () => {
setSearchOpen(false);
setSearchQuery("");
setSelectedSearchMessage(null);
setShowContactInfo(false);
setSelectedConversation(null);
};

return (
<div className="message-container">
{!selectedConversation ? (
<NoChatSelected />
) : (
<>
<div
className={
showContactInfo
? "chat-main-with-contact"
: "chat-main"
}
>
<header className="chat-header">
{searchOpen ? (
<div className="chat-search">
<button
type="button"
className="chat-search-close"
onClick={
handleSearchToggle
}
title="Close search"
>
<FiX />
</button>

<div className="chat-search-input-wrapper">
<FiSearch />

<input
type="text"
placeholder="Search messages..."
value={
searchQuery
}
onChange={(e) =>
setSearchQuery(
e.target.value
)
}
autoFocus
/>
</div>
</div>
) : (
<>
<button
type="button"
className="mobile-back-btn"
onClick={
handleBack
}
title="Back to conversations"
>
<FiArrowLeft />
</button>

<button
type="button"
className="chat-user"
onClick={
handleContactInfoToggle
}
title="Contact info"
>
<div className="chat-avatar">
{selectedConversation.profilePic ? (
<img
src={
selectedConversation.profilePic
}
alt={
selectedConversation.fullName
}
/>
) : (
<div className="chat-avatar-fallback">
{selectedConversation.fullName
?.charAt(0)
?.toUpperCase() || "?"}
</div>
)}

{isOnline && (
<span className="online-dot"></span>
)}
</div>

<div className="chat-user-info">
<div className="chat-user-name-row">
<h3>
{
selectedConversation.fullName
}
</h3>
</div>

<p
className={
isTyping
? "typing"
: isOnline
? "online"
: lastSeenText
? "offline"
: "offline"
}
>
{isTyping
? "Typing..."
: isOnline
? "Online"
: lastSeenText ||
""}
</p>
</div>
</button>

<div className="chat-actions">
<button
type="button"
onClick={
handleSearchToggle
}
title="Search messages"
>
<FiSearch />
</button>

<button
type="button"
title="Voice call"
className="header-action-desktop"
>
<FiPhone />
</button>

<button
type="button"
title="Video call"
className="header-action-desktop"
>
<FiVideo />
</button>

<button
type="button"
title="Contact info"
className="header-more-btn"
onClick={
handleContactInfoToggle
}
>
<FiMoreVertical />
</button>
</div>
</>
)}
</header>

<div className="conversation-context">
<div className="context-icon">
<FiLock />
</div>

<div className="context-content">
<span className="context-title">
End-to-end encrypted
</span>

<span className="context-text">
Messages are secured between you and{" "}
{selectedConversation.fullName}.
</span>
</div>
</div>

<Messages
searchQuery={searchQuery}
selectedSearchMessage={
selectedSearchMessage
}
setSelectedSearchMessage={
setSelectedSearchMessage
}
/>

<MessageInput 
	isBlocked={selectedConversation.isBlocked||
   selectedConversation.isBlockedByOtherUser 
  }
/>
</div>

{showContactInfo && (
<ContactInfo
selectedConversation={
selectedConversation
}
onClose={
handleContactInfoClose
}
/>
)}
</>
)}
</div>
);
};

const NoChatSelected = () => {
const { authUser } = useAuthContext();

return (
<div className="empty-chat">
<div className="empty-card">
<div className="empty-icon">
<TiMessages />
</div>

<h2>
Welcome back,{" "}
{authUser.fullName}
</h2>

<p>
Choose a conversation from the sidebar
and start messaging instantly.
</p>

<div className="empty-security">
<FiLock />

<span>
Your conversations are private and secure.
</span>
</div>
</div>
</div>
);
};

export default MessageContainer;