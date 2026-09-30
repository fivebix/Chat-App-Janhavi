import { useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import "../../style/SendFeedback.css";

const SendFeedback = ({ onBack }) => {
const [feedbackType, setFeedbackType] = useState("General feedback");
const [message, setMessage] = useState("");
const [submitted, setSubmitted] = useState(false);

const handleSubmit = (event) => {
event.preventDefault();

if (!message.trim()) {
return;
}

setSubmitted(true);
setMessage("");
};

return (
<div className="send-feedback">
<div className="send-feedback-header">
<button
type="button"
className="send-feedback-back"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Send feedback</h2>
</div>

<div className="send-feedback-content">
{submitted ? (
<div className="feedback-success">
<div className="feedback-success-icon">
<FiCheck />
</div>

<h3>Thank you for your feedback</h3>

<p>
Your feedback has been recorded. We
appreciate you taking the time to help
improve ChatApp.
</p>

<button
type="button"
className="feedback-back-button"
onClick={() => setSubmitted(false)}
>
Send another
</button>
</div>
) : (
<>
<div className="send-feedback-intro">
<h3>Tell us what you think</h3>

<p>
Share your feedback, report an issue,
or tell us how we can improve ChatApp.
</p>
</div>

<form
className="send-feedback-form"
onSubmit={handleSubmit}
>
<label>
<span>Feedback type</span>

<select
value={feedbackType}
onChange={(event) =>
setFeedbackType(
event.target.value
)
}
>
<option>
General feedback
</option>
<option>Report a bug</option>
<option>Feature request</option>
<option>Other</option>
</select>
</label>

<label>
<span>Your feedback</span>

<textarea
value={message}
onChange={(event) =>
setMessage(
event.target.value
)
}
placeholder="Tell us what you think..."
rows={6}
maxLength={1000}
/>

<small>
{message.length}/1000
</small>
</label>

<button
type="submit"
className="send-feedback-submit"
disabled={!message.trim()}
>
Send feedback
</button>
</form>
</>
)}
</div>
</div>
);
};

export default SendFeedback;