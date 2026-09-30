import { useState } from "react";
import { FiArrowLeft, FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../../style/HelpCenter.css";

const HelpCenter = ({ onBack }) => {
const [openQuestion, setOpenQuestion] = useState(null);

const questions = [
{
id: 1,
question: "How do I start a new conversation?",
answer:
"Use the search option in the sidebar to find a user and select them to start a conversation.",
},
{
id: 2,
question: "How do I send a file or image?",
answer:
"Open a conversation and use the attachment option in the message input to select and send an image or file.",
},
{
id: 3,
question: "How do I edit or delete a message?",
answer:
"Open the actions for one of your messages and choose Edit or Delete.",
},
{
id: 4,
question: "How do I block a user?",
answer:
"Open the conversation menu and select Block. You can also unblock the user from the same menu later.",
},
{
id: 5,
question: "How do I clear a conversation?",
answer:
"Open the conversation menu, select Clear chat, and confirm the action.",
},
{
id: 6,
question: "How do I change my chat settings?",
answer:
"Go to Settings and open Chats. From there you can manage options such as theme, wallpaper, media quality and other chat preferences.",
},
];

const toggleQuestion = (id) => {
setOpenQuestion((current) => (current === id ? null : id));
};

return (
<div className="help-center">
<div className="help-center-header">
<button
type="button"
className="help-center-back"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Help Center</h2>
</div>

<div className="help-center-content">
<div className="help-center-intro">
<h3>How can we help?</h3>
<p>
Find answers to common questions and learn
how ChatApp works.
</p>
</div>

<div className="help-center-questions">
{questions.map((item) => {
const isOpen = openQuestion === item.id;

return (
<div
key={item.id}
className={`help-question ${
isOpen ? "open" : ""
}`}
>
<button
type="button"
className="help-question-button"
onClick={() =>
toggleQuestion(item.id)
}
>
<span>{item.question}</span>

{isOpen ? (
<FiChevronUp />
) : (
<FiChevronDown />
)}
</button>

{isOpen && (
<div className="help-question-answer">
<p>{item.answer}</p>
</div>
)}
</div>
);
})}
</div>
</div>
</div>
);
};

export default HelpCenter;