import './Privacy.css';

import { useNavigate } from 'react-router-dom';

import PrivacyHeader from './components/PrivacyHeader';
import PrivacyIntro from './components/PrivacyIntro';
import PrivacySection from './components/PrivacySection';
import PrivacyContact from './components/PrivacyContact';

function Privacy() {
  const navigate = useNavigate();

  return (
    <main className="privacy_page">
      <PrivacyHeader onBack={() => navigate(-1)} />

      <div className="privacy_container">
        <PrivacyIntro />

        <PrivacySection title="1. Information We Collect">
          <p>
            When you create an account or use RMA, we may collect information
            necessary to provide our services.
          </p>

          <ul>
            <li>Name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Saved delivery addresses</li>
            <li>Location information when you choose to provide it</li>
            <li>Order and transaction information</li>
            <li>Information you provide when contacting support</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="2. How We Use Your Information">
          <p>
            We use collected information to operate and improve RMA, including:
          </p>

          <ul>
            <li>Creating and managing your account</li>
            <li>Processing and delivering orders</li>
            <li>Connecting customers with local shops</li>
            <li>Providing customer support</li>
            <li>Handling payments and order-related records</li>
            <li>Improving our services and user experience</li>
            <li>Preventing fraud and unauthorized activity</li>
          </ul>
        </PrivacySection>

        <PrivacySection title="3. Location Information">
          <p>
            RMA may use your location when you choose to select or provide a
            delivery location. Location information may be used to help
            determine delivery destinations and improve delivery services.
          </p>

          <p>
            You can choose whether to provide location information through the
            features available in the application.
          </p>
        </PrivacySection>

        <PrivacySection title="4. Orders and Payments">
          <p>
            When you place an order, information related to the order may be
            shared with the relevant shop and delivery service where necessary
            to fulfill your order.
          </p>

          <p>
            Payment information may be processed through third-party payment
            providers. RMA does not need to store your complete payment-card
            credentials to process an order.
          </p>
        </PrivacySection>

        <PrivacySection title="5. Information Sharing">
          <p>
            We may share information with parties necessary to provide RMA
            services, such as:
          </p>

          <ul>
            <li>Registered shops fulfilling your order</li>
            <li>Delivery personnel handling your order</li>
            <li>Payment and technology service providers</li>
            <li>Customer support personnel</li>
          </ul>

          <p>
            We do not intend to sell your personal information to third parties.
          </p>
        </PrivacySection>

        <PrivacySection title="6. Data Security">
          <p>
            We take reasonable measures to protect information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <p>
            However, no internet-based service can guarantee absolute security.
          </p>
        </PrivacySection>

        <PrivacySection title="7. Account Information">
          <p>
            You are responsible for keeping your account information accurate
            and for protecting access to your account.
          </p>

          <p>
            If you believe your account has been accessed without authorization,
            contact RMA support.
          </p>
        </PrivacySection>

        <PrivacySection title="8. Data Retention">
          <p>
            We may retain account, order, transaction, and support information
            for as long as reasonably necessary to provide our services, comply
            with legal obligations, resolve disputes, and maintain business
            records.
          </p>
        </PrivacySection>

        <PrivacySection title="9. Your Choices">
          <p>
            Depending on the features available to you, you may be able to
            update your account information, manage saved addresses, or request
            assistance regarding your personal information.
          </p>
        </PrivacySection>

        <PrivacySection title="10. Changes to This Policy">
          <p>
            RMA may update this Privacy Policy from time to time. When changes
            are made, the updated version will be published through the RMA
            platform.
          </p>
        </PrivacySection>

        <PrivacyContact onContact={() => navigate('/profile/help-support')} />
      </div>
    </main>
  );
}

export default Privacy;
