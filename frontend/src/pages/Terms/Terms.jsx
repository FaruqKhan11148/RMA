import './Terms.css';

import { useNavigate } from 'react-router-dom';

function Terms() {
  const navigate = useNavigate();

  return (
    <main className="terms_page">
      {/* HEADER */}
      <div className="terms_header">
        <button className="terms_back" onClick={() => navigate(-1)}>
          ‹
        </button>

        <h1>Terms & Conditions</h1>
      </div>

      <div className="terms_container">
        {/* INTRO */}
        <section className="terms_intro">
          <span className="terms_badge">RMA</span>

          <h2>Welcome to RMA.</h2>

          <p>
            These Terms & Conditions explain the rules that apply when you use
            the RMA platform to discover shops, place orders, make payments, and
            use our related services.
          </p>

          <span className="terms_updated">Last updated: September 2026</span>
        </section>

        {/* 1 */}
        <section className="terms_section">
          <h2>1. About RMA</h2>

          <p>
            RMA is a platform that connects customers with local meat and
            seafood shops. Customers can discover participating shops, view
            available products, place orders, and arrange delivery or pickup
            where available.
          </p>

          <p>
            RMA may facilitate communication, ordering, payment, and
            delivery-related services between customers and participating shops.
          </p>
        </section>

        {/* 2 */}
        <section className="terms_section">
          <h2>2. Customer Accounts</h2>

          <p>To use certain RMA features, you may need to create an account.</p>

          <ul>
            <li>You must provide accurate account information.</li>
            <li>You are responsible for activity under your account.</li>
            <li>You must keep your login credentials secure.</li>
            <li>You must not create an account using false information.</li>
          </ul>
        </section>

        {/* 3 */}
        <section className="terms_section">
          <h2>3. Placing Orders</h2>

          <p>
            When you place an order through RMA, you are requesting products
            from the selected shop.
          </p>

          <p>
            An order may be subject to acceptance by the shop. Product
            availability, quantity, pricing, preparation time, and other order
            details may change based on the shop's actual availability.
          </p>
        </section>

        {/* 4 */}
        <section className="terms_section">
          <h2>4. Product Information</h2>

          <p>
            Shops are responsible for the products they list on the RMA
            platform, including product availability, descriptions, quantities,
            and applicable pricing.
          </p>

          <p>
            Product images and descriptions may be provided for general
            reference and may not always represent the exact appearance of the
            delivered product.
          </p>
        </section>

        {/* 5 */}
        <section className="terms_section">
          <h2>5. Prices and Payments</h2>

          <p>
            Product prices displayed on RMA may be determined by the
            participating shop.
          </p>

          <p>
            Customers are responsible for paying the applicable order amount,
            delivery charges, and any other charges clearly shown during
            checkout.
          </p>

          <p>
            Payments may be processed through third-party payment providers.
            Additional terms from the applicable payment provider may also
            apply.
          </p>
        </section>

        {/* 6 */}
        <section className="terms_section">
          <h2>6. Delivery</h2>

          <p>
            Delivery availability depends on the participating shop, delivery
            area, order conditions, and operational availability.
          </p>

          <p>
            Estimated delivery times are not guaranteed and may be affected by
            preparation time, traffic, weather, demand, location, or other
            circumstances.
          </p>
        </section>

        {/* 7 */}
        <section className="terms_section">
          <h2>7. Order Cancellation</h2>

          <p>
            Cancellation availability may depend on the status of your order.
          </p>

          <p>
            Once a shop has accepted or started preparing an order, cancellation
            may no longer be available or may be subject to applicable
            cancellation rules.
          </p>
        </section>

        {/* 8 */}
        <section className="terms_section">
          <h2>8. Order Issues and Refunds</h2>

          <p>
            If you experience an issue with an order, such as missing,
            incorrect, damaged, or undelivered items, you should contact RMA
            support as soon as reasonably possible.
          </p>

          <p>
            Any refund, replacement, or other resolution may depend on the
            circumstances of the order and the applicable policies.
          </p>
        </section>

        {/* 9 */}
        <section className="terms_section">
          <h2>9. Customer Responsibilities</h2>

          <ul>
            <li>Provide a correct delivery address.</li>
            <li>Provide accurate contact information.</li>
            <li>Be available to receive the order when required.</li>
            <li>Use RMA only for lawful purposes.</li>
            <li>Do not misuse or interfere with the platform.</li>
            <li>Do not attempt unauthorized access to RMA systems.</li>
          </ul>
        </section>

        {/* 10 */}
        <section className="terms_section">
          <h2>10. Shop Responsibilities</h2>

          <p>
            Participating shops are responsible for fulfilling accepted orders
            according to the information and availability represented through
            the platform.
          </p>

          <p>
            Shops may have additional agreements, requirements, or policies
            governing their relationship with RMA.
          </p>
        </section>

        {/* 11 */}
        <section className="terms_section">
          <h2>11. Prohibited Use</h2>

          <p>You must not use RMA to:</p>

          <ul>
            <li>Commit fraud or other unlawful activity.</li>
            <li>Submit intentionally false orders or information.</li>
            <li>Abuse promotions, refunds, or support systems.</li>
            <li>Attempt to gain unauthorized access to the platform.</li>
            <li>Disrupt or damage RMA services.</li>
          </ul>
        </section>

        {/* 12 */}
        <section className="terms_section">
          <h2>12. Platform Availability</h2>

          <p>
            We aim to keep RMA available and reliable, but we cannot guarantee
            that the platform will always be uninterrupted, error-free, or
            available.
          </p>

          <p>
            Services may occasionally be unavailable because of maintenance,
            technical problems, network issues, or circumstances outside our
            reasonable control.
          </p>
        </section>

        {/* 13 */}
        <section className="terms_section">
          <h2>13. Account Suspension or Termination</h2>

          <p>
            RMA may restrict, suspend, or terminate access to an account where
            reasonably necessary, including in cases of suspected fraud, abuse,
            unlawful activity, security concerns, or violation of these Terms.
          </p>
        </section>

        {/* 14 */}
        <section className="terms_section">
          <h2>14. Limitation of Responsibility</h2>

          <p>
            RMA provides a platform connecting customers and participating
            shops. To the extent permitted by applicable law, RMA is not
            responsible for matters outside its reasonable control, including
            shop availability, product availability, delays, or events caused by
            third parties.
          </p>
        </section>

        {/* 15 */}
        <section className="terms_section">
          <h2>15. Changes to These Terms</h2>

          <p>
            RMA may update these Terms & Conditions from time to time. Updated
            terms will be published through the RMA platform.
          </p>

          <p>
            Continued use of RMA after an update may constitute acceptance of
            the revised terms, to the extent permitted by applicable law.
          </p>
        </section>

        {/* 16 */}
        <section className="terms_section">
          <h2>16. Contact</h2>

          <p>
            If you have questions about these Terms & Conditions, please contact
            RMA through our support page.
          </p>
        </section>

        {/* SUPPORT */}
        <section className="terms_contact">
          <h2>Need help?</h2>

          <p>
            If you have a question about an order, account, or RMA service, our
            support section can help.
          </p>

          <button onClick={() => navigate('/profile/help-support')}>
            Visit Help & Support
          </button>
        </section>
      </div>
    </main>
  );
}

export default Terms;
