import { FiArrowLeft, FiMail } from "react-icons/fi";
import "../../style/ContactSupport.css";

const ContactSupport = ({ onBack }) => {
	const supportEmail = "support@chatapp.com";

	const handleEmailSupport = () => {
		window.location.href = `mailto:${supportEmail}?subject=ChatApp Support`;
	};

	return (
		<div className="contact-support">
			<div className="contact-support-header">
				<button
					type="button"
					className="contact-support-back"
					onClick={onBack}
					aria-label="Go back"
				>
					<FiArrowLeft />
				</button>

				<h2>Contact us</h2>
			</div>

			<div className="contact-support-content">
				<div className="contact-support-icon">
					<FiMail />
				</div>

				<h3>Get in touch</h3>

				<p>
					Have a question, found an issue, or need help
					with ChatApp? Send us a message and we'll be
					happy to help.
				</p>

				<div className="contact-support-card">
					<span className="contact-support-label">
						Support email
					</span>

					<span className="contact-support-email">
						{supportEmail}
					</span>
				</div>

				<button
					type="button"
					className="contact-support-button"
					onClick={handleEmailSupport}
				>
					<FiMail />
					<span>Email support</span>
				</button>
			</div>
		</div>
	);
};

export default ContactSupport;