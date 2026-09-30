import "../../style/Conversations.css";

import {
useEffect,
useLayoutEffect,
useRef,
useState,
} from "react";

import {
FiArchive,
FiLock,
FiMessageCircle,
FiPlus,
} from "react-icons/fi";

import toast from "react-hot-toast";

import useGetConversations from "../../hooks/useGetConversations";
import useConversation from "../../zustand/useConversation";
import Conversation from "./Conversation";

const Conversations = () => {
const {
loading,
conversations = [],
setConversations,
} = useGetConversations();

const setUnreadCount = useConversation(
(state) => state.setUnreadCount
);

const [
archivedConversations,
setArchivedConversations,
] = useState([]);

const [
lockedConversations,
setLockedConversations,
] = useState([]);

const [archivedLoading, setArchivedLoading] =
useState(false);

const [lockedLoading, setLockedLoading] =
useState(false);

const [activeFilter, setActiveFilter] =
useState("all");

const conversationRefs =
useRef(new Map());

const previousPositions =
useRef(new Map());

const initializedUnreadCounts =
useRef(new Set());

useEffect(() => {
conversations.forEach((conversation) => {
if (
initializedUnreadCounts.current.has(
conversation._id
)
) {
return;
}

setUnreadCount(
conversation._id,
conversation.unreadCount || 0
);

initializedUnreadCounts.current.add(
conversation._id
);
});
}, [conversations, setUnreadCount]);

useEffect(() => {
archivedConversations.forEach(
(conversation) => {
if (
initializedUnreadCounts.current.has(
conversation._id
)
) {
return;
}

setUnreadCount(
conversation._id,
conversation.unreadCount || 0
);

initializedUnreadCounts.current.add(
conversation._id
);
}
);
}, [
archivedConversations,
setUnreadCount,
]);

useEffect(() => {
lockedConversations.forEach(
(conversation) => {
if (
initializedUnreadCounts.current.has(
conversation._id
)
) {
return;
}

setUnreadCount(
conversation._id,
conversation.unreadCount || 0
);

initializedUnreadCounts.current.add(
conversation._id
);
}
);
}, [
lockedConversations,
setUnreadCount,
]);

const fetchArchivedConversations =
async () => {
setArchivedLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/archived`,
{
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data =
await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to load archived chats"
);
}

setArchivedConversations(
Array.isArray(data)
? data
: []
);
} catch (error) {
console.error(
"Error fetching archived conversations:",
error.message
);

toast.error(
error.message ||
"Failed to load archived chats"
);

setArchivedConversations([]);
} finally {
setArchivedLoading(false);
}
};

const fetchLockedConversations =
async () => {
setLockedLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/locked`,
{
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data =
await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to load locked chats"
);
}

setLockedConversations(
Array.isArray(data)
? data
: []
);
} catch (error) {
console.error(
"Error fetching locked conversations:",
error.message
);

toast.error(
error.message ||
"Failed to load locked chats"
);

setLockedConversations([]);
} finally {
setLockedLoading(false);
}
};

useEffect(() => {
fetchArchivedConversations();
fetchLockedConversations();
}, []);

useLayoutEffect(() => {
const currentPositions =
new Map();

conversationRefs.current.forEach(
(element, id) => {
if (!element) return;

currentPositions.set(
id,
element.getBoundingClientRect()
.top
);
}
);

currentPositions.forEach(
(currentTop, id) => {
const previousTop =
previousPositions.current.get(
id
);

if (
previousTop === undefined
) {
return;
}

const difference =
previousTop - currentTop;

if (difference === 0) {
return;
}

const element =
conversationRefs.current.get(
id
);

if (!element) return;

element.animate(
[
{
transform: `translateY(${difference}px)`,
},
{
transform:
"translateY(0)",
},
],
{
duration: 350,
easing:
"cubic-bezier(0.22, 1, 0.36, 1)",
}
);
}
);

previousPositions.current =
currentPositions;
}, [
conversations,
lockedConversations,
archivedConversations,
]);

useEffect(() => {
const handleConversationActivity = (
event
) => {
const userId =
event.detail?.userId;

if (!userId) return;

const activityUserId =
String(userId);

setConversations(
(currentConversations) => {
if (
!Array.isArray(
currentConversations
)
) {
return currentConversations;
}

const index =
currentConversations.findIndex(
(conversation) =>
String(
conversation._id
) === activityUserId
);

if (index <= 0) {
return currentConversations;
}

const updatedConversation =
currentConversations[index];

return [
updatedConversation,
...currentConversations.filter(
(_, i) =>
i !== index
),
];
}
);
};

window.addEventListener(
"conversationActivity",
handleConversationActivity
);

return () => {
window.removeEventListener(
"conversationActivity",
handleConversationActivity
);
};
}, [setConversations]);

useEffect(() => {
const handleConversationPinned = (
event
) => {
const conversationId =
event.detail?.conversationId;

const isPinned =
event.detail?.isPinned;

if (!conversationId) return;

setConversations(
(currentConversations) => {
if (
!Array.isArray(
currentConversations
)
) {
return currentConversations;
}

const conversation =
currentConversations.find(
(item) =>
String(
item._id
) ===
String(
conversationId
)
);

if (!conversation) {
return currentConversations;
}

const updatedConversation = {
...conversation,
isPinned,
};

const remainingConversations =
currentConversations.filter(
(item) =>
String(
item._id
) !==
String(
conversationId
)
);

if (isPinned) {
return [
updatedConversation,
...remainingConversations,
];
}

const updatedList = [
...remainingConversations,
updatedConversation,
];

return updatedList.sort(
(a, b) => {
if (
a.isPinned &&
!b.isPinned
) {
return -1;
}

if (
!a.isPinned &&
b.isPinned
) {
return 1;
}

return (
new Date(
b.conversationUpdatedAt ||
0
) -
new Date(
a.conversationUpdatedAt ||
0
)
);
}
);
}
);
};

window.addEventListener(
"conversation-pinned",
handleConversationPinned
);

return () => {
window.removeEventListener(
"conversation-pinned",
handleConversationPinned
);
};
}, [setConversations]);

useEffect(() => {
const handleConversationMuted = (
event
) => {
const conversationId =
event.detail?.conversationId;

const isMuted =
event.detail?.isMuted;

const muteExpiresAt =
event.detail?.muteExpiresAt;

if (!conversationId) return;

const updateMutedConversation = (
currentConversations
) =>
currentConversations.map(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
? {
...conversation,
isMuted,
muteExpiresAt,
}
: conversation
);

setConversations(
updateMutedConversation
);

setArchivedConversations(
updateMutedConversation
);
};

window.addEventListener(
"conversation-muted",
handleConversationMuted
);

return () => {
window.removeEventListener(
"conversation-muted",
handleConversationMuted
);
};
}, [setConversations]);

useEffect(() => {
const handleConversationArchived = (
event
) => {
const conversationId =
event.detail;

if (!conversationId) return;

const archivedConversation =
conversations.find(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
);

setConversations(
(currentConversations) => {
if (
!Array.isArray(
currentConversations
)
) {
return currentConversations;
}

return currentConversations.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
);
}
);

if (archivedConversation) {
setArchivedConversations(
(currentArchived) => [
{
...archivedConversation,
isArchived: true,
},
...currentArchived.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
),
]
);
}
};

window.addEventListener(
"conversation-archived",
handleConversationArchived
);

return () => {
window.removeEventListener(
"conversation-archived",
handleConversationArchived
);
};
}, [
conversations,
setConversations,
]);

useEffect(() => {
const handleConversationUnarchived = (
event
) => {
const conversationId =
event.detail;

if (!conversationId) return;

const restoredConversation =
archivedConversations.find(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
);

setArchivedConversations(
(currentArchived) =>
currentArchived.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
)
);

if (restoredConversation) {
setConversations(
(currentConversations) => [
{
...restoredConversation,
isArchived: false,
},
...currentConversations.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
),
]
);
}
};

window.addEventListener(
"conversation-unarchived",
handleConversationUnarchived
);

return () => {
window.removeEventListener(
"conversation-unarchived",
handleConversationUnarchived
);
};
}, [
archivedConversations,
setConversations,
]);

useEffect(() => {
const handleConversationLocked = (
event
) => {
const conversationId =
event.detail?.conversationId;

const isLocked =
event.detail?.isLocked;

if (!conversationId) return;

if (isLocked) {
const lockedConversation =
conversations.find(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
);

setConversations(
(currentConversations) =>
currentConversations.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
)
);

if (lockedConversation) {
setLockedConversations(
(currentLocked) => [
{
...lockedConversation,
isLocked: true,
},
...currentLocked.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
),
]
);
}
} else {
const unlockedConversation =
lockedConversations.find(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
);

setLockedConversations(
(currentLocked) =>
currentLocked.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
)
);

if (unlockedConversation) {
setConversations(
(currentConversations) => [
{
...unlockedConversation,
isLocked: false,
},
...currentConversations.filter(
(conversation) =>
String(
conversation._id
) !==
String(
conversationId
)
),
]
);
}
}
};

const handleFavoriteUpdated = (
event
) => {
const {
conversationId,
isFavorite,
} = event.detail;

setConversations(
(currentConversations) =>
currentConversations.map(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
? {
...conversation,
isFavorite,
}
: conversation
)
);

setArchivedConversations(
(currentConversations) =>
currentConversations.map(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
? {
...conversation,
isFavorite,
}
: conversation
)
);
};

const handleListUpdated = (
event
) => {
const {
conversationId,
listName,
isAdded,
} = event.detail;

const updateConversationLists = (
currentConversations
) =>
currentConversations.map(
(conversation) => {
if (
String(
conversation._id
) !==
String(
conversationId
)
) {
return conversation;
}

const currentLists =
conversation.lists ||
[];

let updatedLists;

if (isAdded) {
const alreadyExists =
currentLists.some(
(list) =>
list.listName ===
listName
);

updatedLists =
alreadyExists
? currentLists
: [
...currentLists,
{
listName,
},
];
} else {
updatedLists =
currentLists.filter(
(list) =>
list.listName !==
listName
);
}

return {
...conversation,
lists: updatedLists,
};
}
);

setConversations(
updateConversationLists
);

setArchivedConversations(
updateConversationLists
);

setLockedConversations(
updateConversationLists
);
};

window.addEventListener(
"conversation-locked",
handleConversationLocked
);

window.addEventListener(
"conversation-favorite-updated",
handleFavoriteUpdated
);

window.addEventListener(
"conversation-list-updated",
handleListUpdated
);

return () => {
window.removeEventListener(
"conversation-locked",
handleConversationLocked
);

window.removeEventListener(
"conversation-favorite-updated",
handleFavoriteUpdated
);

window.removeEventListener(
"conversation-list-updated",
handleListUpdated
);
};
}, [
conversations,
lockedConversations,
setConversations,
]);

useEffect(() => {
const handleConversationMarkedUnread = (
event
) => {
const conversationId =
event.detail?.conversationId;

const unreadCount =
event.detail?.unreadCount || 1;

if (!conversationId) return;

const updateUnreadConversation = (
currentConversations
) =>
currentConversations.map(
(conversation) =>
String(
conversation._id
) ===
String(
conversationId
)
? {
...conversation,
unreadCount,
}
: conversation
);

setConversations(
updateUnreadConversation
);

setArchivedConversations(
updateUnreadConversation
);

setLockedConversations(
updateUnreadConversation
);
};

window.addEventListener(
"conversation-marked-unread",
handleConversationMarkedUnread
);

return () => {
window.removeEventListener(
"conversation-marked-unread",
handleConversationMarkedUnread
);
};
}, [setConversations]);

const unreadCount = conversations.reduce(
(total, conversation) =>
total +
(conversation.unreadCount || 0),
0
);

const listFilters = [
"Work",
"Family",
"Friends",
];

const filteredConversations =
activeFilter === "unread"
? conversations.filter(
(conversation) =>
(conversation.unreadCount ||
0) > 0
)
: activeFilter === "favorites"
? conversations.filter(
(conversation) =>
conversation.isFavorite
)
: activeFilter === "groups"
? conversations.filter(
(conversation) =>
conversation.isGroup
)
: listFilters.includes(
activeFilter
)
? conversations.filter(
(conversation) =>
conversation.lists?.some(
(list) =>
list.listName ===
activeFilter
)
)
: conversations;

const filters = [
{
id: "all",
label: "All",
},
{
id: "unread",
label: "Unread",
count: unreadCount,
},
{
id: "favorites",
label: "Favorites",
},
{
id: "groups",
label: "Groups",
},
...listFilters.map((listName) => ({
id: listName,
label: listName,
})),
];

const isShowingArchived =
activeFilter === "archived";

const isShowingLocked =
activeFilter === "locked";

return (
<div className="conversations-wrapper">
<div className="conversation-filters">
{filters.map((filter) => (
<button
key={filter.id}
type="button"
className={`conversation-filter ${
activeFilter ===
filter.id
? "active"
: ""
}`}
onClick={() =>
setActiveFilter(
filter.id
)
}
>
<span>
{filter.label}
</span>

{filter.count > 0 && (
<span className="filter-count">
{filter.count}
</span>
)}
</button>
))}

<button
type="button"
className={`conversation-filter ${
isShowingLocked
? "active"
: ""
}`}
onClick={() =>
setActiveFilter(
"locked"
)
}
>
<FiLock />

<span>Locked</span>

{lockedConversations.length >
0 && (
<span className="filter-count">
{
lockedConversations.length
}
</span>
)}
</button>

<button
type="button"
className={`conversation-filter ${
isShowingArchived
? "active"
: ""
}`}
onClick={() =>
setActiveFilter(
"archived"
)
}
>
<FiArchive />

<span>Archived</span>

{archivedConversations.length >
0 && (
<span className="filter-count">
{
archivedConversations.length
}
</span>
)}
</button>

<button
type="button"
className="conversation-filter-add"
aria-label="Add filter"
title="Add filter"
>
<FiPlus />
</button>
</div>

<div className="conversations-list">
{loading ||
(isShowingArchived &&
archivedLoading) ||
(isShowingLocked &&
lockedLoading) ? (
<div className="conversation-loader">
<div className="spinner"></div>

<span>
{isShowingArchived
? "Loading archived chats..."
: isShowingLocked
? "Loading locked chats..."
: "Loading conversations..."}
</span>
</div>
) : isShowingLocked ? (
lockedConversations.length >
0 ? (
lockedConversations.map(
(
conversation,
index
) => (
<div
key={
conversation._id
}
ref={(
element
) => {
if (
element
) {
conversationRefs.current.set(
conversation._id,
element
);
} else {
conversationRefs.current.delete(
conversation._id
);
}
}}
>
<Conversation
conversation={{
...conversation,
isLocked:
true,
}}
lastIdx={
index ===
lockedConversations.length -
1
}
/>
</div>
)
)
) : (
<div className="empty-conversations">
<div className="empty-conversations-icon">
<FiLock />
</div>

<h3>
No locked chats
</h3>

<p>
Chats you lock
will appear
here.
</p>
</div>
)
) : isShowingArchived ? (
archivedConversations.length >
0 ? (
archivedConversations.map(
(
conversation,
index
) => (
<div
key={
conversation._id
}
ref={(
element
) => {
if (
element
) {
conversationRefs.current.set(
conversation._id,
element
);
} else {
conversationRefs.current.delete(
conversation._id
);
}
}}
>
<Conversation
conversation={
conversation
}
lastIdx={
index ===
archivedConversations.length -
1
}
/>
</div>
)
)
) : (
<div className="empty-conversations">
<div className="empty-conversations-icon">
<FiArchive />
</div>

<h3>
No archived chats
</h3>

<p>
Chats you archive
will appear
here.
</p>
</div>
)
) : filteredConversations.length >
0 ? (
filteredConversations.map(
(
conversation,
index
) => (
<div
key={
conversation._id
}
ref={(
element
) => {
if (
element
) {
conversationRefs.current.set(
conversation._id,
element
);
} else {
conversationRefs.current.delete(
conversation._id
);
}
}}
>
<Conversation
conversation={
conversation
}
lastIdx={
index ===
filteredConversations.length -
1
}
/>
</div>
)
)
) : (
<div className="empty-conversations">
<div className="empty-conversations-icon">
<FiMessageCircle />
</div>

<h3>
{activeFilter ===
"unread"
? "No unread conversations"
: listFilters.includes(
activeFilter
)
? `No ${activeFilter.toLowerCase()} conversations`
: "No conversations yet"}
</h3>

<p>
{activeFilter ===
"unread"
? "You're all caught up."
: listFilters.includes(
activeFilter
)
? `Chats added to ${activeFilter} will appear here.`
: "Start a new conversation and your chats will appear here."}
</p>
</div>
)}
</div>
</div>
);
};

export default Conversations;