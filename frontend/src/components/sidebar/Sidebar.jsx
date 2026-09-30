import { useState } from "react";

import "../../style/Sidebar.css";

import {
FiArrowLeft,
FiMessageSquare,
FiSearch,
FiSettings,
FiUser,
} from "react-icons/fi";

import { useAuthContext } from "../../context/AuthContext";

import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import ProfileView from "./ProfileView";
import NewChat from "./NewChat";
import NewContact from "./NewContact";
import NewGroup from "./NewGroup";
import NewCommunity from "./NewCommunity";

import Settings from "../settings/Settings";
import AccountSettings from "../settings/AccountSettings";
import PrivacySettings from "../settings/PrivacySettings";
import PrivacyAdvanced from "../settings/PrivacyAdvanced";
import ChatsSettings from "../settings/ChatsSettings";
import NotificationsSettings from "../settings/NotificationsSettings";
import KeyboardShortcuts from "../settings/KeyboardShortcuts";
import HelpFeedback from "../settings/HelpFeedback";

const Sidebar = () => {
const { authUser } = useAuthContext();

const [activeScreen, setActiveScreen] =
useState("main");

const [isSearchOpen, setIsSearchOpen] =
useState(false);

const goToMain = () => {
setActiveScreen("main");
setIsSearchOpen(false);
};

const goToSettings = () => {
setActiveScreen("settings");
setIsSearchOpen(false);
};

const goToNewChat = () => {
setActiveScreen("new-chat");
setIsSearchOpen(false);
};

const goToNewContact = () => {
setActiveScreen("new-contact");
};

const goToNewGroup = () => {
setActiveScreen("new-group");
};

const goToNewCommunity = () => {
setActiveScreen("new-community");
};

const goToProfile = () => {
setActiveScreen("profile");
setIsSearchOpen(false);
};

if (activeScreen === "profile") {
return (
<aside className="sidebar">
<ProfileView onBack={goToMain} />
</aside>
);
}

if (activeScreen === "new-chat") {
return (
<aside className="sidebar">
<NewChat
onBack={goToMain}
onNewContact={goToNewContact}
onNewGroup={goToNewGroup}
onNewCommunity={goToNewCommunity}
/>
</aside>
);
}

if (activeScreen === "new-contact") {
return (
<aside className="sidebar">
<NewContact onBack={goToNewChat} />
</aside>
);
}

if (activeScreen === "new-group") {
return (
<aside className="sidebar">
<NewGroup onBack={goToNewChat} />
</aside>
);
}

if (activeScreen === "new-community") {
return (
<aside className="sidebar">
<NewCommunity onBack={goToNewChat} />
</aside>
);
}

if (activeScreen === "settings") {
return (
<aside className="sidebar">
<Settings
onBack={goToMain}
onOpenProfile={() =>
setActiveScreen("profile")
}
onOpenAccount={() =>
setActiveScreen("account")
}
onOpenPrivacy={() =>
setActiveScreen("privacy")
}
onOpenChats={() =>
setActiveScreen("chats")
}
onOpenNotifications={() =>
setActiveScreen(
"notifications"
)
}
onOpenShortcuts={() =>
setActiveScreen("shortcuts")
}
onOpenHelp={() =>
setActiveScreen("help")
}
onLogout={() => {}}
/>
</aside>
);
}

if (activeScreen === "account") {
return (
<aside className="sidebar">
<AccountSettings
onBack={goToSettings}
/>
</aside>
);
}

if (activeScreen === "privacy") {
return (
<aside className="sidebar">
<PrivacySettings
onBack={goToSettings}
onOpenAdvanced={() =>
setActiveScreen(
"privacy-advanced"
)
}
/>
</aside>
);
}

if (activeScreen === "privacy-advanced") {
return (
<aside className="sidebar">
<PrivacyAdvanced
onBack={() =>
setActiveScreen("privacy")
}
/>
</aside>
);
}

if (activeScreen === "chats") {
return (
<aside className="sidebar">
<ChatsSettings
onBack={goToSettings}
/>
</aside>
);
}

if (activeScreen === "notifications") {
return (
<aside className="sidebar">
<NotificationsSettings
onBack={goToSettings}
/>
</aside>
);
}

if (activeScreen === "shortcuts") {
return (
<aside className="sidebar">
<KeyboardShortcuts
onBack={goToSettings}
/>
</aside>
);
}

if (activeScreen === "help") {
return (
<aside className="sidebar">
<HelpFeedback
onBack={goToSettings}
/>
</aside>
);
}

return (
<aside className="sidebar">
<div className="sidebar-top">
{isSearchOpen ? (
<div className="sidebar-search-row">
<button
type="button"
className="sidebar-search-back"
onClick={() =>
setIsSearchOpen(false)
}
aria-label="Close search"
title="Close search"
>
<FiArrowLeft />
</button>

<div className="sidebar-search-expanded">
<SearchInput />
</div>
</div>
) : (
<div className="sidebar-compact-header">
<div className="sidebar-brand">
<div className="brand-logo">
<FiMessageSquare />
</div>

<div className="brand-info">
<h2>ChatApp</h2>
</div>
</div>

<div className="sidebar-header-actions">
<button
type="button"
className="sidebar-header-profile"
onClick={goToProfile}
aria-label="Open profile"
title="Profile"
>
{authUser?.profilePic ? (
<img
src={
  authUser.profilePic
}
alt={
  authUser.fullName ||
  "Profile"
}
/>
) : (
<FiUser />
)}
</button>

<button
type="button"
className="sidebar-header-search"
onClick={() =>
setIsSearchOpen(true)
}
aria-label="Search conversations"
title="Search"
>
<FiSearch />
</button>
</div>
</div>
)}
</div>

<div className="sidebar-divider"></div>

<div className="sidebar-section-header">
<div className="sidebar-section-title">
<h3>Chats</h3>
</div>

<button
type="button"
className="sidebar-new-chat"
onClick={goToNewChat}
aria-label="New chat"
title="New chat"
>
<FiMessageSquare />
</button>
</div>

<div className="sidebar-conversations">
<Conversations />
</div>

<div className="sidebar-footer">
<button
type="button"
className="sidebar-settings-button"
onClick={goToSettings}
aria-label="Settings"
title="Settings"
>
<FiSettings />
<span>Settings</span>
</button>

<LogoutButton />
</div>
</aside>
);
};

export default Sidebar;