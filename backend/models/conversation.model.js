import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
{
participants: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
],

messages: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Message",
default: [],
},
],

archivedBy: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
],

pinnedBy: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
],

favoriteBy: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
],

lists: [
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
listName: {
type: String,
trim: true,
},
},
],

lockedBy: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
],

mutedBy: [
{
userId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
expiresAt: {
type: Date,
default: null,
},
},
],
},
{ timestamps: true }
);

const Conversation = mongoose.model(
"Conversation",
conversationSchema
);

export default Conversation;