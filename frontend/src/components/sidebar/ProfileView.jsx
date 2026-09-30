import { useRef, useState } from "react";

import {
FiArrowLeft,
FiCamera,
FiEdit2,
FiEye,
FiEyeOff,
FiLock,
FiLogOut,
FiUser,
} from "react-icons/fi";

import Cropper from "react-easy-crop";

import { useAuthContext } from "../../context/AuthContext";
import useLogout from "../../hooks/useLogout";
import useProfile from "../../hooks/useProfile";

import "../../style/ProfileView.css";

const ProfileView = ({ onBack }) => {
const { authUser } = useAuthContext();

const {
updateProfile,
updateProfilePicture,
changePassword,
loading,
} = useProfile();

const {
loading: logoutLoading,
logout,
} = useLogout();

const fileInputRef = useRef(null);

const [isEditingProfile, setIsEditingProfile] =
useState(false);

const [editFullName, setEditFullName] =
useState(authUser?.fullName || "");

const [editUsername, setEditUsername] =
useState(authUser?.username || "");

const [showPasswordForm, setShowPasswordForm] =
useState(false);

const [currentPassword, setCurrentPassword] =
useState("");

const [newPassword, setNewPassword] =
useState("");

const [confirmPassword, setConfirmPassword] =
useState("");

const [showCurrentPassword, setShowCurrentPassword] =
useState(false);

const [showNewPassword, setShowNewPassword] =
useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

const [selectedImage, setSelectedImage] =
useState(null);

const [crop, setCrop] = useState({
x: 0,
y: 0,
});

const [zoom, setZoom] = useState(1);

const [croppedAreaPixels, setCroppedAreaPixels] =
useState(null);

const [cropLoading, setCropLoading] =
useState(false);

const handleEditProfile = () => {
setEditFullName(authUser?.fullName || "");
setEditUsername(authUser?.username || "");
setIsEditingProfile(true);
};

const handleCancelEdit = () => {
setEditFullName(authUser?.fullName || "");
setEditUsername(authUser?.username || "");
setIsEditingProfile(false);
};

const handleProfileSubmit = async (event) => {
event.preventDefault();

const success = await updateProfile({
fullName: editFullName,
username: editUsername,
});

if (success) {
setIsEditingProfile(false);
}
};

const handleProfilePictureChange = (event) => {
const file = event.target.files?.[0];

if (!file) return;

if (!file.type.startsWith("image/")) {
event.target.value = "";
return;
}

const imageUrl = URL.createObjectURL(file);

setSelectedImage(imageUrl);

setCrop({
x: 0,
y: 0,
});

setZoom(1);
setCroppedAreaPixels(null);

event.target.value = "";
};

const handleCropComplete = (
_croppedArea,
croppedAreaPixels
) => {
setCroppedAreaPixels(croppedAreaPixels);
};

const createCroppedImage = (
imageSrc,
pixelCrop
) => {
return new Promise(
(resolve, reject) => {
const image = new Image();

image.src = imageSrc;

image.onload = () => {
const canvas =
document.createElement(
"canvas"
);

const ctx =
canvas.getContext("2d");

if (!ctx) {
reject(
new Error(
"Could not create canvas"
)
);

return;
}

canvas.width =
pixelCrop.width;

canvas.height =
pixelCrop.height;

ctx.drawImage(
image,
pixelCrop.x,
pixelCrop.y,
pixelCrop.width,
pixelCrop.height,
0,
0,
pixelCrop.width,
pixelCrop.height
);

canvas.toBlob(
(blob) => {
if (!blob) {
reject(
new Error(
"Could not create image"
)
);

return;
}

resolve(blob);
},
"image/jpeg",
0.92
);
};

image.onerror = () => {
reject(
new Error(
"Could not load image"
)
);
};
}
);
};

const handleSaveCrop = async () => {
if (
!selectedImage ||
!croppedAreaPixels
) {
return;
}

setCropLoading(true);

try {
const croppedImage =
await createCroppedImage(
selectedImage,
croppedAreaPixels
);

const croppedFile = new File(
[croppedImage],
"profile-picture.jpg",
{
type: "image/jpeg",
}
);

const success =
await updateProfilePicture(
croppedFile
);

if (success) {
URL.revokeObjectURL(
selectedImage
);

setSelectedImage(null);

setCrop({
x: 0,
y: 0,
});

setZoom(1);

setCroppedAreaPixels(null);
}
} catch (error) {
console.error(
"Error cropping image:",
error
);
} finally {
setCropLoading(false);
}
};

const handleCancelCrop = () => {
if (selectedImage) {
URL.revokeObjectURL(selectedImage);
}

setSelectedImage(null);

setCrop({
x: 0,
y: 0,
});

setZoom(1);

setCroppedAreaPixels(null);
};

const handlePasswordSubmit = async (
event
) => {
event.preventDefault();

const success =
await changePassword({
currentPassword,
newPassword,
confirmPassword,
});

if (success) {
setCurrentPassword("");
setNewPassword("");
setConfirmPassword("");

setShowCurrentPassword(false);
setShowNewPassword(false);
setShowConfirmPassword(false);

setShowPasswordForm(false);
}
};

const handleLogout = async () => {
await logout();
};

return (
<div className="profile-view">
<div className="profile-header">
<button
type="button"
className="profile-back-button"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Profile</h2>
</div>

<div className="profile-content">
<div className="profile-picture-section">
<div className="profile-picture-wrapper">
<img
src={authUser?.profilePic}
alt={
authUser?.fullName ||
"Profile"
}
className="profile-picture"
/>

<button
type="button"
className="profile-camera-button"
onClick={() =>
fileInputRef.current?.click()
}
disabled={
loading ||
cropLoading
}
aria-label="Change profile picture"
>
<FiCamera />
</button>
</div>

<input
ref={fileInputRef}
type="file"
accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
onChange={
handleProfilePictureChange
}
hidden
/>

<h3>
{authUser?.fullName}
</h3>

<p>
@{authUser?.username}
</p>
</div>

<div className="profile-info-card">
{isEditingProfile ? (
<form
className="edit-profile-form"
onSubmit={
handleProfileSubmit
}
>
<div className="edit-profile-input-group">
<label htmlFor="edit-full-name">
Full Name
</label>

<input
id="edit-full-name"
type="text"
value={
editFullName
}
onChange={(e) =>
setEditFullName(
e.target.value
)
}
placeholder="Enter your full name"
required
/>
</div>

<div className="edit-profile-input-group">
<label htmlFor="edit-username">
Username
</label>

<div className="edit-username-input">
<span>@</span>

<input
id="edit-username"
type="text"
value={
editUsername
}
onChange={(e) =>
setEditUsername(
e.target.value
)
}
placeholder="Enter username"
required
/>
</div>
</div>

<div className="edit-profile-actions">
<button
type="button"
className="edit-profile-cancel"
onClick={
handleCancelEdit
}
disabled={
loading
}
>
Cancel
</button>

<button
type="submit"
className="edit-profile-save"
disabled={
loading
}
>
{loading
? "Saving..."
: "Save Changes"}
</button>
</div>
</form>
) : (
<>
<div className="profile-info-item">
<div className="profile-info-icon">
<FiUser />
</div>

<div>
<span>Name</span>

<strong>
{
authUser?.fullName
}
</strong>
</div>
</div>

<div className="profile-info-item">
<div className="profile-info-icon">
<FiLock />
</div>

<div>
<span>Username</span>

<strong>
@
{
authUser?.username
}
</strong>
</div>
</div>

<button
type="button"
className="edit-profile-button"
onClick={
handleEditProfile
}
>
<FiEdit2 />

<span>
Edit Profile
</span>
</button>
</>
)}
</div>

<div className="profile-section">
<button
type="button"
className="profile-action-button"
onClick={() =>
setShowPasswordForm(
!showPasswordForm
)
}
>
<div className="profile-action-left">
<div className="profile-action-icon">
<FiLock />
</div>

<div>
<strong>
Change Password
</strong>

<span>
Update your account password
</span>
</div>
</div>

<span className="profile-action-arrow">
›
</span>
</button>

{showPasswordForm && (
<form
className="password-form"
onSubmit={
handlePasswordSubmit
}
>
<div className="password-input-wrapper">
<input
type={
showCurrentPassword
? "text"
: "password"
}
placeholder="Current password"
value={
currentPassword
}
onChange={(e) =>
setCurrentPassword(
e.target.value
)
}
required
/>

<button
type="button"
className="password-eye-button"
onClick={() =>
setShowCurrentPassword(
!showCurrentPassword
)
}
aria-label={
showCurrentPassword
? "Hide current password"
: "Show current password"
}
>
{showCurrentPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

<div className="password-input-wrapper">
<input
type={
showNewPassword
? "text"
: "password"
}
placeholder="New password"
value={
newPassword
}
onChange={(e) =>
setNewPassword(
e.target.value
)
}
required
/>

<button
type="button"
className="password-eye-button"
onClick={() =>
setShowNewPassword(
!showNewPassword
)
}
aria-label={
showNewPassword
? "Hide new password"
: "Show new password"
}
>
{showNewPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

<div className="password-input-wrapper">
<input
type={
showConfirmPassword
? "text"
: "password"
}
placeholder="Confirm new password"
value={
confirmPassword
}
onChange={(e) =>
setConfirmPassword(
e.target.value
)
}
required
/>

<button
type="button"
className="password-eye-button"
onClick={() =>
setShowConfirmPassword(
!showConfirmPassword
)
}
aria-label={
showConfirmPassword
? "Hide confirm password"
: "Show confirm password"
}
>
{showConfirmPassword ? (
<FiEyeOff />
) : (
<FiEye />
)}
</button>
</div>

<button
type="submit"
className="change-password-button"
disabled={loading}
>
{loading
? "Updating..."
: "Update Password"}
</button>
</form>
)}
</div>

<button
type="button"
className="profile-logout-button"
onClick={handleLogout}
disabled={logoutLoading}
>
<FiLogOut />

<span>
{logoutLoading
? "Logging out..."
: "Logout"}
</span>
</button>
</div>

{selectedImage && (
<div className="crop-modal">
<div className="crop-modal-card">
<div className="crop-modal-header">
<h3>
Adjust Profile Picture
</h3>

<p>
Drag to reposition and
zoom to adjust
</p>
</div>

<div className="crop-container">
<Cropper
image={selectedImage}
crop={crop}
zoom={zoom}
aspect={1}
cropShape="round"
showGrid={false}
onCropChange={
setCrop
}
onZoomChange={
setZoom
}
onCropComplete={
handleCropComplete
}
/>
</div>

<div className="crop-controls">
<span>−</span>

<input
type="range"
min={1}
max={3}
step={0.1}
value={zoom}
onChange={(e) =>
setZoom(
Number(
e.target.value
)
)
}
/>

<span>+</span>
</div>

<div className="crop-actions">
<button
type="button"
className="crop-cancel-button"
onClick={
handleCancelCrop
}
disabled={
cropLoading
}
>
Cancel
</button>

<button
type="button"
className="crop-save-button"
onClick={
handleSaveCrop
}
disabled={
cropLoading
}
>
{cropLoading
? "Saving..."
: "Save Picture"}
</button>
</div>
</div>
</div>
)}
</div>
);
};

export default ProfileView;