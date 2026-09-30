import { useState } from "react";
import "../../style/HelpFeedback.css";
import HelpCenter from "./HelpCenter";
import ContactSupport from "./ContactSupport";
import SendFeedback from "./SendFeedback";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsPrivacy from "./TermsPrivacy";

import {
FiArrowLeft,
FiBookOpen,
FiMessageCircle,
FiFileText,
FiShield,
FiSend,
} from "react-icons/fi";

const HelpFeedback = ({ onBack }) => {
const [activeScreen, setActiveScreen] = useState(null);

const helpOptions = [
{
id: "help-center",
icon: <FiBookOpen />,
title: "Help Center",
description:
"Find answers to common questions and learn how ChatApp works.",
},
{
id: "contact",
icon: <FiMessageCircle />,
title: "Contact us",
description:
"Get in touch with the ChatApp support team.",
},
{
id: "feedback",
icon: <FiSend />,
title: "Send feedback",
description:
"Tell us what you think or report an issue.",
},
{
id: "privacy",
icon: <FiShield />,
title: "Privacy Policy",
description:
"Learn how your information is handled and protected.",
},
{
id: "terms",
icon: <FiFileText />,
title: "Terms and Privacy Policy",
description:
"Read the terms and policies for using ChatApp.",
},
];

if (activeScreen === "help-center") {
return (
<HelpCenter
onBack={() => setActiveScreen(null)}
/>
);
}

if (activeScreen === "contact") {
return (
<ContactSupport
  onBack={() => setActiveScreen(null)}
/>
);
}

if (activeScreen === "feedback") {
	return (
		<SendFeedback
			onBack={() => setActiveScreen(null)}
		/>
	);
}

if (activeScreen === "privacy") {
	return (
		<PrivacyPolicy
			onBack={() => setActiveScreen(null)}
		/>
	);
}

if (activeScreen === "terms") {
	return (
		<TermsPrivacy
			onBack={() => setActiveScreen(null)}
		/>
	);
}

return (
<div className="help-feedback">
<div className="help-feedback-header">
<button
type="button"
className="settings-back-button"
onClick={onBack}
aria-label="Back"
>
<FiArrowLeft />
</button>

<h1>Help and feedback</h1>
</div>

<div className="help-feedback-content">
<div className="help-feedback-intro">
<h2>How can we help?</h2>

<p>
Find useful information, contact support,
or share your feedback about ChatApp.
</p>
</div>

<div className="help-feedback-list">
{helpOptions.map((option) => (
<button
key={option.id}
type="button"
className="help-feedback-item"
onClick={() => {
if (option.id === "help-center") {
setActiveScreen("help-center");
}

if (option.id === "contact") {
		setActiveScreen("contact");
}

if (option.id === "feedback") {
		setActiveScreen("feedback");
}


if (option.id === "privacy") {
  setActiveScreen("privacy");
}

if (option.id === "terms") {
		setActiveScreen("terms");
}
}}
>
<div className="help-feedback-icon">
{option.icon}
</div>

<div className="help-feedback-item-content">
<span className="help-feedback-title">
{option.title}
</span>

<span className="help-feedback-description">
{option.description}
</span>
</div>

<span className="help-feedback-arrow">
›
</span>
</button>
))}
</div>

<div className="help-feedback-footer">
<span>ChatApp</span>
<span>Version 1.0.0</span>
</div>
</div>
</div>
);
};

export default HelpFeedback;