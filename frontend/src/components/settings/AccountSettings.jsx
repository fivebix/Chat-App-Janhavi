import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import "../../style/AccountSettings.css";

import {
FiArrowLeft,
FiShield,
FiFileText,
FiInfo,
FiDownload,
FiTrash2,
} from "react-icons/fi";

const AccountSettings = ({ onBack }) => {
const [activeOption, setActiveOption] =
useState(null);

const [securityNotifications, setSecurityNotifications] =
useState(true);

const [securityLoading, setSecurityLoading] =
useState(false);

const [securitySaving, setSecuritySaving] =
useState(false);

const [accountInfoStatus, setAccountInfoStatus] =
useState("none");

const [accountInfoLoading, setAccountInfoLoading] =
useState(false);

const [accountInfoSaving, setAccountInfoSaving] =
useState(false);

const [accountInfoDownloading, setAccountInfoDownloading] =
useState(false);

const [deleteConfirmation, setDeleteConfirmation] =
useState(false);

const [accountDeleting, setAccountDeleting] =
useState(false);

const accountOptions = [
{
id: "security",
icon: <FiShield />,
title: "Security notifications",
},
{
id: "account-info",
icon: <FiFileText />,
title: "Request account info",
},
{
id: "delete-account",
icon: <FiInfo />,
title: "How to delete my account",
},
];

useEffect(() => {
if (activeOption !== "security") {
return;
}

const fetchSecurityNotifications = async () => {
setSecurityLoading(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/security-notifications`,
{
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to load security notifications"
);
}

setSecurityNotifications(
data.securityNotifications
);
} catch (error) {
console.error(
"Error loading security notifications:",
error
);

toast.error(
error.message ||
"Failed to load security notifications"
);
} finally {
setSecurityLoading(false);
}
};

fetchSecurityNotifications();
}, [activeOption]);

useEffect(() => {
if (activeOption !== "account-info") {
return;
}

const fetchAccountInfoRequest = async () => {
setAccountInfoLoading(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/account-info-request`,
{
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to load account information request"
);
}

setAccountInfoStatus(
data.status || "none"
);
} catch (error) {
console.error(
"Error loading account information request:",
error
);

toast.error(
error.message ||
"Failed to load account information request"
);
} finally {
setAccountInfoLoading(false);
}
};

fetchAccountInfoRequest();
}, [activeOption]);

const handleSecurityToggle = async () => {
if (securityLoading || securitySaving) {
return;
}

const newValue =
!securityNotifications;

setSecurityNotifications(newValue);
setSecuritySaving(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/security-notifications`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
enabled: newValue,
}),
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to update security notifications"
);
}

setSecurityNotifications(
data.securityNotifications
);

toast.success(
data.securityNotifications
? "Security notifications enabled"
: "Security notifications disabled"
);
} catch (error) {
console.error(
"Error updating security notifications:",
error
);

setSecurityNotifications(
!newValue
);

toast.error(
error.message ||
"Failed to update security notifications"
);
} finally {
setSecuritySaving(false);
}
};

const handleAccountInfoRequest = async () => {
if (
accountInfoLoading ||
accountInfoSaving ||
accountInfoStatus !== "none"
) {
return;
}

setAccountInfoSaving(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/account-info-request`,
{
method: "POST",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to submit account information request"
);
}

setAccountInfoStatus(
data.status || "processing"
);

toast.success(
data.message ||
"Account information is ready"
);
} catch (error) {
console.error(
"Error requesting account information:",
error
);

toast.error(
error.message ||
"Failed to submit account information request"
);
} finally {
setAccountInfoSaving(false);
}
};

const handleDownloadAccountInfo = async () => {
if (accountInfoDownloading) {
return;
}

setAccountInfoDownloading(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/account-info-request/download`,
{
method: "GET",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

if (!response.ok) {
const data = await response.json();

throw new Error(
data.error ||
"Failed to download account information"
);
}

const blob = await response.blob();

const downloadUrl =
window.URL.createObjectURL(blob);

const link =
document.createElement("a");

link.href = downloadUrl;
link.download =
"account-information.pdf";

document.body.appendChild(link);
link.click();
link.remove();

window.URL.revokeObjectURL(downloadUrl);

toast.success(
"Account information downloaded"
);
} catch (error) {
console.error(
"Error downloading account information:",
error
);

toast.error(
error.message ||
"Failed to download account information"
);
} finally {
setAccountInfoDownloading(false);
}
};

const handleDeleteAccount = async () => {
if (accountDeleting) {
return;
}

setAccountDeleting(true);

try {
const token =
localStorage.getItem("chat-token");

const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/account`,
{
method: "DELETE",
headers: {
Authorization: `Bearer ${token}`,
},
}
);

const data = await response.json();

if (!response.ok) {
throw new Error(
data.error ||
"Failed to delete account"
);
}

localStorage.removeItem("chat-token");
localStorage.removeItem("chat-user");

toast.success(
"Account deleted successfully"
);

setTimeout(() => {
window.location.reload();
}, 500);
} catch (error) {
console.error(
"Error deleting account:",
error
);

toast.error(
error.message ||
"Failed to delete account"
);

setAccountDeleting(false);
setDeleteConfirmation(false);
}
};

if (activeOption === "account-info") {
return (
<div className="account-settings">
<div className="account-settings-header">
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
Request account info
</h1>
</div>

<div className="account-settings-content">
<div className="security-notification-card">
<div className="security-notification-icon">
<FiFileText />
</div>

<div>
<h2>
Request account
information
</h2>

<p>
Request a copy of the
information associated
with your account.
</p>
</div>
</div>

<div className="account-info-details">
<h3>
What's included
</h3>

<p>
Your account information
may include:
</p>

<ul>
<li>
Profile information
</li>

<li>
Account details
</li>

<li>
Account creation
information
</li>
</ul>
</div>

{accountInfoStatus === "none" && (
<button
type="button"
className="account-info-request-button"
onClick={
handleAccountInfoRequest
}
disabled={
accountInfoLoading ||
accountInfoSaving
}
>
{accountInfoLoading
? "Loading..."
: accountInfoSaving
? "Preparing..."
: "Request account information"}
</button>
)}

{accountInfoStatus ===
"processing" && (
<>
<button
type="button"
className="account-info-request-button"
disabled
>
Preparing account information...
</button>

<p className="account-info-status">
Your account information
is being prepared.
</p>
</>
)}

{accountInfoStatus === "ready" && (
<>
<button
type="button"
className="account-info-request-button"
onClick={
handleDownloadAccountInfo
}
disabled={
accountInfoDownloading
}
>
<FiDownload />

{accountInfoDownloading
? "Downloading..."
: "Download account information"}
</button>

<p className="account-info-status">
Your account information
is ready to download.
</p>
</>
)}
</div>
</div>
);
}

if (activeOption === "security") {
return (
<div className="account-settings">
<div className="account-settings-header">
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
Security notifications
</h1>
</div>

<div className="account-settings-content">
<div className="security-notification-card">
<div className="security-notification-icon">
<FiShield />
</div>

<div>
<h2>
Security notifications
</h2>

<p>
Get notified when your
security code changes
for a contact.
</p>
</div>
</div>

<div className="security-notification-option">
<div>
<h3>
Show security
notifications
</h3>

<p>
Receive notifications when
the security code of a
contact changes.
</p>
</div>

<label className="settings-toggle">
<input
type="checkbox"
checked={
securityNotifications
}
onChange={
handleSecurityToggle
}
disabled={
securityLoading ||
securitySaving
}
/>

<span className="settings-toggle-slider" />
</label>
</div>
</div>
</div>
);
}

if (activeOption === "delete-account") {
return (
<div className="account-settings">
<div className="account-settings-header">
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
Delete account
</h1>
</div>

<div className="account-settings-content">
<div className="security-notification-card">
<div className="security-notification-icon">
<FiTrash2 />
</div>

<div>
<h2>
Delete your account
</h2>

<p>
Permanently remove your
ChatApp account and its
associated data.
</p>
</div>
</div>

<div className="account-info-details">
<h3>
Before you continue
</h3>

<p>
Deleting your account is
permanent. Your account,
messages, and conversations
will be deleted and cannot be
recovered.
</p>
</div>

{!deleteConfirmation ? (
<button
type="button"
className="account-delete-button"
onClick={() =>
setDeleteConfirmation(
true
)
}
>
<FiTrash2 />
Delete account
</button>
) : (
<div className="account-delete-confirmation">
<h3>
Are you sure?
</h3>

<p>
This action cannot be
undone. Your account and
associated chat data will
be permanently deleted.
</p>

<div className="account-delete-actions">
<button
type="button"
className="account-delete-cancel"
onClick={() =>
setDeleteConfirmation(
false
)
}
disabled={
accountDeleting
}
>
Cancel
</button>

<button
type="button"
className="account-delete-confirm"
onClick={
handleDeleteAccount
}
disabled={
accountDeleting
}
>
{accountDeleting
? "Deleting..."
: "Yes, delete my account"}
</button>
</div>
</div>
)}
</div>
</div>
);
}

return (
<div className="account-settings">
<div className="account-settings-header">
<button
type="button"
className="settings-back-button"
onClick={onBack}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>Account</h1>
</div>

<div className="account-settings-list">
{accountOptions.map((option) => (
<button
key={option.id}
type="button"
className="account-settings-item"
onClick={() => {
if (
option.id ===
"security" ||
option.id ===
"account-info" ||
option.id ===
"delete-account"
) {
setActiveOption(
option.id
);
}
}}
>
<div className="account-settings-icon">
{option.icon}
</div>

<span className="account-settings-title">
{option.title}
</span>

<span className="account-settings-arrow">
›
</span>
</button>
))}
</div>
</div>
);
};

export default AccountSettings;