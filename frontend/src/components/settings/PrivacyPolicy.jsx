import { FiArrowLeft } from "react-icons/fi";
import "../../style/PrivacyPolicy.css";

const PrivacyPolicy = ({ onBack }) => {
	return (
		<div className="privacy-policy">
			<div className="privacy-policy-header">
				<button
					type="button"
					className="privacy-policy-back"
					onClick={onBack}
					aria-label="Go back"
				>
					<FiArrowLeft />
				</button>

				<h2>Privacy Policy</h2>
			</div>

			<div className="privacy-policy-content">
				<div className="privacy-policy-intro">
					<h3>Your privacy matters</h3>

					<p>
						This Privacy Policy explains how ChatApp
						handles information when you use the
						application.
					</p>

					<small>Last updated: September 2026</small>
				</div>

				<section>
					<h3>1. Information we collect</h3>

					<p>
						When you use ChatApp, we may store information
						needed to provide the application's features,
						such as your name, username, profile picture,
						and account information.
					</p>
				</section>

				<section>
					<h3>2. Messages and files</h3>

					<p>
						Messages, images, GIFs, and files that you send
						through ChatApp are processed so they can be
						delivered to the intended conversation.
					</p>
				</section>

				<section>
					<h3>3. How we use your information</h3>

					<p>
						Information is used to provide and maintain
						ChatApp features, authenticate your account,
						deliver messages, and improve the application's
						functionality.
					</p>
				</section>

				<section>
					<h3>4. Profile information</h3>

					<p>
						Your profile information may be visible to
						other users depending on the features and
						privacy settings available in ChatApp.
					</p>
				</section>

				<section>
					<h3>5. Local storage</h3>

					<p>
						ChatApp may use browser local storage to
						remember certain preferences and maintain
						your session on your device.
					</p>
				</section>

				<section>
					<h3>6. Data security</h3>

					<p>
						Reasonable technical measures are used to
						protect account information and application
						data. However, no method of storing or
						transmitting information over the internet
						can be guaranteed to be completely secure.
					</p>
				</section>

				<section>
					<h3>7. Third-party services</h3>

					<p>
						Some ChatApp features may rely on third-party
						services for functionality such as file
						storage or external content. These services
						may process information according to their
						own privacy policies.
					</p>
				</section>

				<section>
					<h3>8. Your choices</h3>

					<p>
						You can manage available account, privacy,
						chat, and notification settings directly
						through the application.
					</p>
				</section>

				<section>
					<h3>9. Changes to this policy</h3>

					<p>
						This Privacy Policy may be updated from time
						to time. Any changes will be reflected on
						this page.
					</p>
				</section>

				<section>
					<h3>10. Contact</h3>

					<p>
						If you have questions about this Privacy
						Policy, you can contact the ChatApp support
						team through the Contact us section.
					</p>
				</section>
			</div>
		</div>
	);
};

export default PrivacyPolicy;