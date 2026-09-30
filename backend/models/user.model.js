import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
fullName: {
type: String,
required: true,
},

username: {
type: String,
required: true,
unique: true,
},

password: {
type: String,
required: true,
minlength: 6,
},

gender: {
type: String,
required: true,
enum: ["male", "female"],
},

profilePic: {
type: String,
default: "",
},

profilePicPrivacy: {
type: String,
enum: ["everyone", "contacts", "nobody"],
default: "everyone",
},

lastSeen: {
type: Date,
default: null,
},

lastSeenPrivacy: {
type: String,
enum: ["everyone", "contacts", "nobody"],
default: "everyone",
},

onlinePrivacy: {
type: String,
enum: ["everyone", "contacts", "nobody"],
default: "everyone",
},

securityNotifications: {
type: Boolean,
default: true,
},

chatLockPassword: {
	type: String,
	default: null,
},

accountInfoRequest: {
status: {
type: String,
enum: ["none", "processing", "ready"],
default: "none",
},

requestedAt: {
type: Date,
default: null,
},

readyAt: {
type: Date,
default: null,
},
},
blockedUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;