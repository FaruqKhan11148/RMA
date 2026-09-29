import './PrivacyPolicy.css';

import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <main className="privacy_policy_page">
      <header className="privacy_policy_header">
        <div className="privacy_policy_icon">
          <ShieldCheck size={24} strokeWidth={2} />
        </div>

        <h1>Privacy Policy</h1>

        <p>
          How RMA collects, uses, and protects information when you use the
          platform.
        </p>

        <span className="privacy_policy_updated">
          Last updated: September 2026
        </span>
      </header>

      <section className="privacy_policy_content">
        <article className="privacy_policy_section">
          <h2>1. About This Policy</h2>

          <p>
            This Privacy Policy explains how RMA (Raw Meat Application) handles
            information provided by customers, shop owners, and delivery
            partners when using the RMA platform.
          </p>

          <p>
            RMA is a local meat ordering platform that connects customers with
            registered local meat shops and supports the management of orders
            and deliveries.
          </p>
        </article>

        <article className="privacy_policy_section">
          <h2>2. Information We Collect</h2>

          <p>
            Depending on how you use RMA, we may collect information necessary
            to provide and operate the services, including:
          </p>

          <ul>
            <li>Name and contact details</li>
            <li>Mobile number and email address</li>
            <li>Delivery address and location information</li>
            <li>Order and transaction-related information</li>
            <li>Account and shop information</li>
            <li>Information provided when contacting RMA support</li>
          </ul>
        </article>

        <article className="privacy_policy_section">
          <h2>3. How We Use Information</h2>

          <p>Information collected through RMA may be used to:</p>

          <ul>
            <li>Create and manage user accounts</li>
            <li>Process and manage orders</li>
            <li>Facilitate delivery of orders</li>
            <li>Connect customers with the selected shop</li>
            <li>Provide customer support</li>
            <li>Maintain and improve the RMA platform</li>
            <li>
              Help protect the platform against misuse or unauthorized activity
            </li>
          </ul>
        </article>
      </section>

      <button
        className="privacy_policy_back"
        onClick={() => navigate('/about')}
      >
        Back to About RMA
      </button>
    </main>
  );
}

export default PrivacyPolicy;
