import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import "../../style/PrivacySettings.css";

import {
FiArrowLeft,
FiChevronRight,
FiLock,
} from "react-icons/fi";

const PrivacySettings = ({
onBack,
onOpenAdvanced,
}) => {
const [activeOption, setActiveOption] =
useState(null);

const [lastSeenPrivacy, setLastSeenPrivacy] =
useState("everyone");

const [onlinePrivacy, setOnlinePrivacy] =
useState("everyone");

const [profilePicPrivacy, setProfilePicPrivacy] =
useState("everyone");

const [privacyLoading, setPrivacyLoading] =
useState(false);

const [privacySaving, setPrivacySaving] =
useState(false);

const privacyOptions = [
{
id: "last-seen",
title: "Last seen and online",
value:
activeOption === "last-seen"
? ""
: `${formatPrivacyValue(
lastSeenPrivacy
)} • ${formatPrivacyValue(
onlinePrivacy
)}`,
},
{
id: "profile-picture",
title: "Profile picture",
value: formatPrivacyValue(
profilePicPrivacy
),
},
{
id: "about",
title: "About",
value: "My contacts",
},
{
id: "status",
title: "Status",
value: "1 contact included",
},
];

const secondaryOptions = [
{
id: "message-timer",
title: "Default message timer",
value: "Off",
},
{
id: "groups",
title: "Groups",
value: "Everyone",
},
{
id: "blocked",
title: "Blocked contacts",
value: "0",
},
{
id: "app-lock",
title: "App lock",
value: "Require password to unlock ChatApp",
},
];

function formatPrivacyValue(value) {
if (value === "everyone") {
return "Everyone";
}

if (value === "contacts") {
return "My contacts";
}

if (value === "nobody") {
return "Nobody";
}

return "Everyone";
}

useEffect(() => {
const fetchPrivacySettings = async () => {
setPrivacyLoading(true);

try {
const token =
localStorage.getItem("chat-token");

const [
lastSeenResponse,
profilePicResponse,
] = await Promise.all([
fetch(
`${import.meta.env.VITE_API_URL}/api/users/last-seen-privacy`,
{
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
}
),
fetch(
`${import.meta.env.VITE_API_URL}/api/users/profile-picture-privacy`,
{
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
}
),
]);

const lastSeenData =
await lastSeenResponse.json();

const profilePicData =
await profilePicResponse.json();

if (!lastSeenResponse.ok) {
throw new Error(
lastSeenData.error ||
"Failed to load privacy settings"
);
}

if (!profilePicResponse.ok) {
throw new Error(
profilePicData.error ||
"Failed to load profile picture privacy"
);
}

setLastSeenPrivacy(
lastSeenData.lastSeenPrivacy ||
"everyone"
);

setOnlinePrivacy(
lastSeenData.onlinePrivacy ||
"everyone"
);

setProfilePicPrivacy(
profilePicData.profilePicPrivacy ||
"everyone"
);
} catch (error) {
console.error(
"Error loading privacy settings:",
error
);

toast.error(
error.message ||
"Failed to load privacy settings"
);
} finally {
setPrivacyLoading(false);
}
};

fetchPrivacySettings();
}, []);

const handlePrivacySave = async (
newLastSeenPrivacy,
newOnlinePrivacy
) => {
if (privacySaving) {
return;
}

setPrivacySaving(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/last-seen-privacy`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
lastSeenPrivacy:
newLastSeenPrivacy,
onlinePrivacy:
newOnlinePrivacy,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update privacy settings"
);
}

setLastSeenPrivacy(
data.lastSeenPrivacy
);

setOnlinePrivacy(
data.onlinePrivacy
);

toast.success(
"Privacy settings updated"
);
} catch (error) {
console.error(
"Error updating privacy settings:",
error
);

toast.error(
error.message ||
"Failed to update privacy settings"
);
} finally {
setPrivacySaving(false);
}
};

const handleProfilePictureSave = async (
value
) => {
if (privacySaving) {
return;
}

setPrivacySaving(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/profile-picture-privacy`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
profilePicPrivacy: value,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update profile picture privacy"
);
}

setProfilePicPrivacy(
data.profilePicPrivacy
);

toast.success(
"Profile picture privacy updated"
);
} catch (error) {
console.error(
"Error updating profile picture privacy:",
error
);

toast.error(
error.message ||
"Failed to update profile picture privacy"
);
} finally {
setPrivacySaving(false);
}
};

const handleLastSeenChange = (value) => {
handlePrivacySave(
value,
onlinePrivacy
);
};

const handleOnlineChange = (value) => {
handlePrivacySave(
lastSeenPrivacy,
value
);
};

if (activeOption === "last-seen") {
return (
<div className="privacy-settings">
<div className="privacy-settings-header">
<button
type="button"
className="settings-back-button"
onClick={() =>
setActiveOption(null)
}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>
Last seen and online
</h1>
</div>

<div className="privacy-settings-content">
{privacyLoading ? (
<div className="privacy-loading">
Loading privacy settings...
</div>
) : (
<>
<section className="privacy-section">
<h2>
Who can see my last seen
</h2>

<div className="privacy-options">
{[
{
value: "everyone",
label: "Everyone",
},
{
value: "contacts",
label: "My contacts",
},
{
value: "nobody",
label: "Nobody",
},
].map((option) => (
<button
key={option.value}
type="button"
className="privacy-option"
onClick={() =>
handleLastSeenChange(
option.value
)
}
disabled={
privacySaving
}
>
<div className="privacy-option-content">
<span className="privacy-option-title">
{option.label}
</span>
</div>

<span className="privacy-radio">
{lastSeenPrivacy ===
option.value &&
"✓"}
</span>
</button>
))}
</div>
</section>

<section className="privacy-section">
<h2>
Who can see when I'm online
</h2>

<div className="privacy-options">
{[
{
value: "everyone",
label: "Everyone",
},
{
value: "contacts",
label: "My contacts",
},
{
value: "nobody",
label: "Nobody",
},
].map((option) => (
<button
key={option.value}
type="button"
className="privacy-option"
onClick={() =>
handleOnlineChange(
option.value
)
}
disabled={
privacySaving
}
>
<div className="privacy-option-content">
<span className="privacy-option-title">
{option.label}
</span>
</div>

<span className="privacy-radio">
{onlinePrivacy ===
option.value &&
"✓"}
</span>
</button>
))}
</div>
</section>
</>
)}
</div>
</div>
);
}

if (activeOption === "profile-picture") {
return (
<div className="privacy-settings">
<div className="privacy-settings-header">
<button
type="button"
className="settings-back-button"
onClick={() =>
setActiveOption(null)
}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>
Profile picture
</h1>
</div>

<div className="privacy-settings-content">
{privacyLoading ? (
<div className="privacy-loading">
Loading privacy settings...
</div>
) : (
<section className="privacy-section">
<h2>
Who can see my profile picture
</h2>

<div className="privacy-options">
{[
{
value: "everyone",
label: "Everyone",
},
{
value: "contacts",
label: "My contacts",
},
{
value: "nobody",
label: "Nobody",
},
].map((option) => (
<button
key={option.value}
type="button"
className="privacy-option"
onClick={() =>
handleProfilePictureSave(
option.value
)
}
disabled={
privacySaving
}
>
<div className="privacy-option-content">
<span className="privacy-option-title">
{option.label}
</span>
</div>

<span className="privacy-radio">
{profilePicPrivacy ===
option.value &&
"✓"}
</span>
</button>
))}
</div>
</section>
)}
</div>
</div>
);
}

return (
<div className="privacy-settings">
<div className="privacy-settings-header">
<button
type="button"
className="settings-back-button"
onClick={onBack}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>Privacy</h1>
</div>

<div className="privacy-settings-content">
<section className="privacy-section">
<h2>
Who can see my personal info
</h2>

<div className="privacy-options">
{privacyOptions.map((option) => (
<button
key={option.id}
type="button"
className="privacy-option"
onClick={() => {
if (
option.id ===
"last-seen"
) {
setActiveOption(
"last-seen"
);
}

if (
option.id ===
"profile-picture"
) {
setActiveOption(
"profile-picture"
);
}
}}
>
<div className="privacy-option-content">
<span className="privacy-option-title">
{option.title}
</span>

<span className="privacy-option-value">
{option.value}
</span>
</div>

<FiChevronRight className="privacy-chevron" />
</button>
))}
</div>
</section>

<section className="privacy-section">
<div className="privacy-toggle-row">
<div className="privacy-toggle-content">
<span className="privacy-option-title">
Read receipts
</span>

<p>
If turned off, you won't
send or receive read
receipts. Read receipts
are always sent for group
chats.
</p>
</div>

<label className="privacy-switch">
<input
type="checkbox"
defaultChecked
/>

<span className="privacy-slider" />
</label>
</div>
</section>

<section className="privacy-section">
<h2>
Disappearing messages
</h2>

<div className="privacy-options">
{secondaryOptions.map(
(option) => (
<button
key={option.id}
type="button"
className="privacy-option"
>
<div className="privacy-option-content">
<span className="privacy-option-title">
{option.title}
</span>

<span className="privacy-option-value">
{option.value}
</span>
</div>

<FiChevronRight className="privacy-chevron" />
</button>
)
)}
</div>
</section>

<section className="privacy-section privacy-advanced-section">
<button
type="button"
className="privacy-advanced-button"
onClick={onOpenAdvanced}
>
<FiLock />

<div>
<span>Advanced</span>

<small>
More privacy and security controls
</small>
</div>

<FiChevronRight />
</button>
</section>
</div>
</div>
);
};

export default PrivacySettings;