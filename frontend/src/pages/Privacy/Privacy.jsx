import './Privacy.css';

import { useNavigate } from 'react-router-dom';

function Privacy() {
  const navigate = useNavigate();

  return (
    <main className="privacy_page">
      {/* HEADER */}
      <div className="privacy_header">
        <button className="privacy_back" onClick={() => navigate(-1)}>
          ‹
        </button>

        <h1>Privacy Policy</h1>
      </div>

      <div className="privacy_container">
        {/* INTRO */}
        <section className="privacy_intro">
          <span className="privacy_badge">RMA</span>

          <h2>Your privacy matters to us.</h2>

          <p>
            This Privacy Policy explains how RMA collects, uses, stores, and
            protects information when you use our platform.
          </p>

          <span className="privacy_updated">Last updated: September 2026</span>
        </section>

        {/* 1 */}
        <section className="privacy_section">
          <h2>1. Information We Collect</h2>

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
        </section>

        {/* 2 */}
        <section className="privacy_section">
          <h2>2. How We Use Your Information</h2>

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
        </section>

        {/* 3 */}
        <section className="privacy_section">
          <h2>3. Location Information</h2>

          <p>
            RMA may use your location when you choose to select or provide a
            delivery location. Location information may be used to help
            determine delivery destinations and improve delivery services.
          </p>

          <p>
            You can choose whether to provide location information through the
            features available in the application.
          </p>
        </section>

        {/* 4 */}
        <section className="privacy_section">
          <h2>4. Orders and Payments</h2>

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
        </section>

        {/* 5 */}
        <section className="privacy_section">
          <h2>5. Information Sharing</h2>

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
        </section>

        {/* 6 */}
        <section className="privacy_section">
          <h2>6. Data Security</h2>

          <p>
            We take reasonable measures to protect information against
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <p>
            However, no internet-based service can guarantee absolute security.
          </p>
        </section>

        {/* 7 */}
        <section className="privacy_section">
          <h2>7. Account Information</h2>

          <p>
            You are responsible for keeping your account information accurate
            and for protecting access to your account.
          </p>

          <p>
            If you believe your account has been accessed without authorization,
            contact RMA support.
          </p>
        </section>

        {/* 8 */}
        <section className="privacy_section">
          <h2>8. Data Retention</h2>

          <p>
            We may retain account, order, transaction, and support information
            for as long as reasonably necessary to provide our services, comply
            with legal obligations, resolve disputes, and maintain business
            records.
          </p>
        </section>

        {/* 9 */}
        <section className="privacy_section">
          <h2>9. Your Choices</h2>

          <p>
            Depending on the features available to you, you may be able to
            update your account information, manage saved addresses, or request
            assistance regarding your personal information.
          </p>
        </section>

        {/* 10 */}
        <section className="privacy_section">
          <h2>10. Changes to This Policy</h2>

          <p>
            RMA may update this Privacy Policy from time to time. When changes
            are made, the updated version will be published through the RMA
            platform.
          </p>
        </section>

        {/* CONTACT */}
        <section className="privacy_contact">
          <h2>Questions about privacy?</h2>

          <p>
            If you have questions or concerns about this Privacy Policy, please
            contact RMA through our support page.
          </p>

          <button onClick={() => navigate('/profile/help-support')}>
            Contact RMA Support
          </button>
        </section>
      </div>
    </main>
  );
}

export default Privacy;
