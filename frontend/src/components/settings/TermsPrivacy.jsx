import { FiArrowLeft } from "react-icons/fi";
import "../../style/TermsPrivacy.css";

const TermsPrivacy = ({ onBack }) => {
return (
<div className="terms-privacy">
<div className="terms-privacy-header">
<button
type="button"
className="terms-privacy-back"
onClick={onBack}
aria-label="Go back"
>
<FiArrowLeft />
</button>

<h2>Terms and Privacy Policy</h2>
</div>

<div className="terms-privacy-content">
<div className="terms-privacy-intro">
<h3>Terms of Service</h3>

<p>
These terms explain the rules and conditions
for using ChatApp.
</p>

<small>Last updated: September 2026</small>
</div>

<section>
<h3>1. Using ChatApp</h3>

<p>
You are responsible for using ChatApp in a
respectful and lawful manner. You should not
use the application for activities that
violate applicable laws or the rights of
others.
</p>
</section>

<section>
<h3>2. Your account</h3>

<p>
You are responsible for keeping your account
credentials secure and for activity performed
through your account.
</p>
</section>

<section>
<h3>3. Messages and content</h3>

<p>
You are responsible for the messages, images,
files, and other content you choose to send
through ChatApp.
</p>
</section>

<section>
<h3>4. Prohibited use</h3>

<p>
You must not use ChatApp to distribute
malicious software, abuse other users,
attempt unauthorized access, or interfere
with the operation of the application.
</p>
</section>

<section>
<h3>5. Blocking and reporting</h3>

<p>
ChatApp provides features such as blocking
users to help you control your interactions.
You should use these features when necessary
to manage unwanted communication.
</p>
</section>

<section>
<h3>6. Application availability</h3>

<p>
ChatApp may occasionally be unavailable due
to maintenance, updates, technical issues,
or circumstances outside our control.
</p>
</section>

<section>
<h3>7. Changes to ChatApp</h3>

<p>
Features and functionality may be changed,
added, or removed as the application evolves.
</p>
</section>

<section>
<h3>8. Privacy</h3>

<p>
Your use of ChatApp is also subject to our
Privacy Policy, which explains how information
associated with your use of the application
is handled.
</p>
</section>

<section>
<h3>9. Changes to these terms</h3>

<p>
These terms may be updated from time to time.
Updated terms will be reflected on this page.
</p>
</section>

<section>
<h3>10. Contact</h3>

<p>
If you have questions about these terms or
ChatApp's policies, you can contact the
support team through the Contact us section.
</p>
</section>

<div className="terms-privacy-footer">
<p>
By using ChatApp, you acknowledge that you
have read and understood these terms and the
associated Privacy Policy.
</p>
</div>
</div>
</div>
);
};

export default TermsPrivacy;