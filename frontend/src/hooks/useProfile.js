import { useState } from "react";
import toast from "react-hot-toast";

import { useAuthContext } from "../context/AuthContext";

const useProfile = () => {
const { authUser, setAuthUser } =
useAuthContext();

const [loading, setLoading] =
useState(false);

const updateProfile = async ({
fullName,
username,
}) => {
setLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const res = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/profile`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
fullName,
username,
}),
}
);

const data =
await res.json();

if (!res.ok || data.error) {
throw new Error(
data.error ||
"Failed to update profile"
);
}

const updatedUser = {
...authUser,
...data.user,
};

setAuthUser(updatedUser);

localStorage.setItem(
"chat-user",
JSON.stringify(updatedUser)
);

toast.success(
"Profile updated successfully"
);

return true;
} catch (error) {
console.error(
"Error updating profile:",
error.message
);

toast.error(
error.message ||
"Failed to update profile"
);

return false;
} finally {
setLoading(false);
}
};

const updateProfilePicture = async (
file
) => {
if (!file) return false;

setLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const formData =
new FormData();

formData.append(
"profilePic",
file
);

const res = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/profile-picture`,
{
method: "PUT",
headers: {
Authorization: `Bearer ${token}`,
},
body: formData,
}
);

const data =
await res.json();

if (!res.ok || data.error) {
throw new Error(
data.error ||
"Failed to update profile picture"
);
}

const updatedUser = {
...authUser,
...data.user,
};

setAuthUser(updatedUser);

localStorage.setItem(
"chat-user",
JSON.stringify(updatedUser)
);

toast.success(
"Profile picture updated"
);

return true;
} catch (error) {
console.error(
"Error updating profile picture:",
error.message
);

toast.error(
error.message ||
"Failed to update profile picture"
);

return false;
} finally {
setLoading(false);
}
};

const changePassword = async ({
currentPassword,
newPassword,
confirmPassword,
}) => {
setLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const res = await fetch(
`${import.meta.env.VITE_API_URL}/api/users/change-password`,
{
method: "PUT",
headers: {
"Content-Type":
"application/json",

Authorization: `Bearer ${token}`,
},
body: JSON.stringify({
currentPassword,
newPassword,
confirmPassword,
}),
}
);

const data =
await res.json();

if (!res.ok || data.error) {
throw new Error(
data.error ||
"Failed to change password"
);
}

toast.success(
"Password changed successfully"
);

return true;
} catch (error) {
console.error(
"Error changing password:",
error.message
);

toast.error(
error.message ||
"Failed to change password"
);

return false;
} finally {
setLoading(false);
}
};

return {
updateProfile,
updateProfilePicture,
changePassword,
loading,
};
};

export default useProfile;