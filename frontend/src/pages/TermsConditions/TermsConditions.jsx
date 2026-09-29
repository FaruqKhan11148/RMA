import './TermsConditions.css';

import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TermsConditions() {
  const navigate = useNavigate();

  return (
    <main className="terms_conditions_page">
      <header className="terms_conditions_header">
        <div className="terms_conditions_icon">
          <FileText size={24} strokeWidth={2} />
        </div>

        <h1>Terms & Conditions</h1>

        <p>The terms that apply when using the RMA platform.</p>

        <span className="terms_conditions_updated">
          Last updated: September 2026
        </span>
      </header>

      <section className="terms_conditions_content">
        <article className="terms_conditions_section">
          <h2>1. About RMA</h2>

          <p>
            RMA (Raw Meat Application) is a local meat ordering platform that
            connects customers with registered local meat shops and supports the
            management of orders and deliveries.
          </p>

          <p>
            By using RMA, you agree to use the platform in accordance with these
            Terms & Conditions.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>2. Customer Accounts</h2>

          <p>
            Customers may be required to provide accurate information, including
            their name, mobile number, email address, and delivery details, when
            using services that require an account.
          </p>

          <p>
            You are responsible for providing accurate information and keeping
            your account information up to date.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>3. Shops and Products</h2>

          <p>
            RMA allows registered meat shops to create and manage their shop
            profiles and product listings.
          </p>

          <p>
            Product names, prices, availability, and other shop-related
            information are provided and managed by the respective shop.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>4. Orders</h2>

          <p>
            Customers can select available products from a participating shop
            and place an order through RMA.
          </p>

          <p>
            An order is subject to the shop's availability and acceptance. Order
            status may change as the shop processes the order.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>5. Delivery</h2>

          <p>
            RMA supports delivery of orders placed through participating shops.
          </p>

          <p>
            Delivery availability, delivery charges, delivery distance,
            estimated delivery time, and related conditions may depend on the
            shop and the delivery arrangements available for the order.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>6. Payments</h2>

          <p>
            Payments for orders may be processed through the payment services
            made available by RMA.
          </p>

          <p>
            Payment processing may be subject to the terms and conditions of the
            applicable payment service provider.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>7. Customer Responsibilities</h2>

          <p>
            Customers are responsible for providing accurate order and delivery
            information and for being available to receive their orders at the
            provided delivery location.
          </p>

          <p>
            Customers must not misuse the RMA platform or use it for unlawful
            activities.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>8. Shop Responsibilities</h2>

          <p>
            Registered shops are responsible for maintaining accurate
            information about their shop, products, prices, availability, and
            orders managed through RMA.
          </p>
        </article>

        <article className="terms_conditions_section">
          <h2>9. Changes to These Terms</h2>

          <p>
            RMA may update these Terms & Conditions when changes are made to the
            platform, its services, or applicable requirements.
          </p>

          <p>
            The updated version will be made available through the RMA platform.
          </p>
        </article>
      </section>

      <button
        className="terms_conditions_back"
        onClick={() => navigate('/about')}
      >
        Back to About RMA
      </button>
    </main>
  );
}

export default TermsConditions;
