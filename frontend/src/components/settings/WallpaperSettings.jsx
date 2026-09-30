import { FiArrowLeft, FiCheck } from "react-icons/fi";
import "../../style/WallpaperSettings.css";

const WallpaperSettings = ({
onBack,
selectedWallpaper,
onWallpaperChange,
}) => {
const wallpapers = [
{
id: "default",
title: "Default",
className: "wallpaper-default",
},
{
id: "brown",
title: "Warm Brown",
className: "wallpaper-brown",
},
{
id: "dark",
title: "Deep Dark",
className: "wallpaper-dark",
},
{
id: "cream",
title: "Soft Cream",
className: "wallpaper-cream",
},
];

return (
<div className="wallpaper-settings">
<div className="wallpaper-settings-header">
<button
type="button"
className="wallpaper-settings-back"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Wallpaper</h2>
</div>

<div className="wallpaper-settings-content">
<p className="wallpaper-settings-description">
Choose a background for your conversations.
</p>

<div className="wallpaper-options">
{wallpapers.map((wallpaper) => (
<button
key={wallpaper.id}
type="button"
className={`wallpaper-option ${
selectedWallpaper === wallpaper.id
? "selected"
: ""
}`}
onClick={() =>
onWallpaperChange(wallpaper.id)
}
>
<div
className={`wallpaper-preview ${wallpaper.className}`}
/>

<div className="wallpaper-option-info">
<span>{wallpaper.title}</span>

<div className="wallpaper-radio">
{selectedWallpaper === wallpaper.id && (
<FiCheck />
)}
</div>
</div>
</button>
))}
</div>
</div>
</div>
);
};

export default WallpaperSettings;