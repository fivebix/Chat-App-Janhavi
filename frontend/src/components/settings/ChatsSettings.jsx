import { useState } from "react";
import "../../style/ChatsSettings.css";

import {
FiArrowLeft,
FiChevronRight,
FiImage,
FiCheck,
} from "react-icons/fi";

import MediaUploadQuality from "./MediaUploadQuality";
import WallpaperSettings from "./WallpaperSettings";

const ChatsSettings = ({ onBack }) => {
const [activeSetting, setActiveSetting] = useState(null);
const [mediaQuality, setMediaQuality] = useState("Standard");
const [selectedWallpaper, setSelectedWallpaper] = useState("default");

const chatOptions = [
{
id: "theme",
title: "Theme",
value: "Dark",
},
{
id: "wallpaper",
title: "Wallpaper",
value:
selectedWallpaper === "default"
? "Default"
: selectedWallpaper === "brown"
? "Warm Brown"
: selectedWallpaper === "dark"
? "Deep Dark"
: "Soft Cream",
},
{
id: "media-quality",
title: "Media upload quality",
value: mediaQuality,
},
{
id: "auto-download",
title: "Media auto-download",
value: "Photos and videos",
},
];

if (activeSetting === "media-quality") {
return (
<MediaUploadQuality
onBack={() => setActiveSetting(null)}
selectedQuality={mediaQuality}
onQualityChange={setMediaQuality}
/>
);
}

if (activeSetting === "wallpaper") {
return (
<WallpaperSettings
onBack={() => setActiveSetting(null)}
selectedWallpaper={selectedWallpaper}
onWallpaperChange={setSelectedWallpaper}
/>
);
}

return (
<div className="chats-settings">
<div className="chats-settings-header">
<button
type="button"
className="settings-back-button"
onClick={onBack}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>Chats</h1>
</div>

<div className="chats-settings-content">
<section className="chats-settings-section">
{chatOptions.map((option) => (
<button
key={option.id}
type="button"
className="chat-setting-item"
onClick={() => {
if (option.id === "media-quality") {
setActiveSetting("media-quality");
}

if (option.id === "wallpaper") {
setActiveSetting("wallpaper");
}
}}
>
<div className="chat-setting-content">
<span className="chat-setting-title">
{option.title}
</span>

<span className="chat-setting-value">
{option.value}
</span>
</div>

<FiChevronRight className="chat-setting-chevron" />
</button>
))}
</section>

<section className="chats-settings-section">
<div className="chat-setting-toggle">
<div className="chat-setting-content">
<span className="chat-setting-title">
Spell check
</span>

<span className="chat-setting-description">
Check spelling while typing messages.
</span>
</div>

<label className="chat-setting-switch">
<input
type="checkbox"
defaultChecked
/>
<span />
</label>
</div>

<div className="chat-setting-toggle">
<div className="chat-setting-content">
<span className="chat-setting-title">
Replace text with emoji
</span>

<span className="chat-setting-description">
Automatically replace supported text
with emoji while typing.
</span>
</div>

<label className="chat-setting-switch">
<input
type="checkbox"
defaultChecked
/>
<span />
</label>
</div>

<div className="chat-setting-toggle">
<div className="chat-setting-content">
<span className="chat-setting-title">
Enter is send
</span>

<span className="chat-setting-description">
Press Enter to send a message instead
of creating a new line.
</span>
</div>

<label className="chat-setting-switch">
<input
type="checkbox"
defaultChecked
/>
<span />
</label>
</div>
</section>

<section className="chats-settings-section wallpaper-card">
<div className="wallpaper-preview">
<div className="wallpaper-preview-overlay">
<FiImage />
</div>
</div>

<div className="wallpaper-info">
<span>Chat wallpaper</span>
<small>
Customize the background of your
conversations.
</small>
</div>

<FiCheck className="wallpaper-check" />
</section>
</div>
</div>
);
};

export default ChatsSettings;