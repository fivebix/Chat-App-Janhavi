import { FiArrowLeft, FiCheck } from "react-icons/fi";
import "../../style/MediaUploadQuality.css";

const MediaUploadQuality = ({
onBack,
selectedQuality,
onQualityChange,
}) => {
const options = [
{
value: "Standard",
title: "Standard",
description: "Faster to send and uses less data",
},
{
value: "HD",
title: "HD",
description: "Higher quality, but uses more data",
},
];

return (
<div className="media-quality-settings">
<div className="media-quality-header">
<button
type="button"
className="media-quality-back"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Media upload quality</h2>
</div>

<div className="media-quality-content">
<p className="media-quality-description">
Choose the quality of media you send.
</p>

<div className="media-quality-options">
{options.map((option) => (
<button
key={option.value}
type="button"
className={`media-quality-option ${
selectedQuality === option.value
? "selected"
: ""
}`}
onClick={() =>
onQualityChange(option.value)
}
>
<div className="media-quality-option-text">
<span className="media-quality-title">
{option.title}
</span>

<span className="media-quality-option-description">
{option.description}
</span>
</div>

<div className="media-quality-radio">
{selectedQuality === option.value && (
<FiCheck />
)}
</div>
</button>
))}
</div>
</div>
</div>
);
};

export default MediaUploadQuality;