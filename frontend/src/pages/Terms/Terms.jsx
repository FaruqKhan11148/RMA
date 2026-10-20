import './Terms.css';

import { useNavigate } from 'react-router-dom';

function Terms({ onBack }) {
  const navigate = useNavigate();

  return (
    <main className="terms_page">
      {/* HEADER */}
      <div className="terms_header">
        <button className="terms_back" onClick={onBack || (() => navigate(-1))}>
          ‹
        </button>

        <h1>Terms &amp; Conditions</h1>
      </div>

      <div className="terms_container">
        <section className="terms_intro">
          <span className="terms_badge">RMA</span>

          <h2>Welcome to RMA.</h2>

          <p>
            These Terms &amp; Conditions explain the rules that apply when you
            access or use the RMA (Raw Meat Application) platform, discover
            participating shops, place orders, arrange delivery or pickup, and
            use related services.
          </p>

          <p>
            Please read these terms carefully before using the platform. By
            accessing or using RMA, you agree to these terms to the extent
            permitted by applicable law.
          </p>

          <span className="terms_updated">Last updated: October 2026</span>
        </section>

        <section className="terms_section">
          <h2>1. About RMA</h2>

          <p>
            RMA is a platform intended to help customers discover participating
            local meat and seafood shops and place orders for available
            products. Depending on the shop and location, customers may be able
            to choose delivery or pickup.
          </p>

          <p>
            RMA provides digital tools for shop discovery, order management,
            customer communication, and delivery coordination where available.
            The specific services offered may vary by location and operational
            availability.
          </p>

          <p>
            Unless expressly stated otherwise, RMA acts as a platform connecting
            customers with participating shops and is not itself the seller of
            products listed by those shops.
          </p>
        </section>

        <section className="terms_section">
          <h2>2. Eligibility and Customer Accounts</h2>

          <p>
            You must be legally eligible to use the services and enter into
            applicable agreements in your jurisdiction. If you are not legally
            able to do so, you must not use account-based services without
            appropriate authorization.
          </p>

          <ul>
            <li>Provide accurate and up-to-date account information.</li>
            <li>
              Use a mobile number or other details that you are authorized to
              provide.
            </li>
            <li>Keep your login credentials and account access secure.</li>
            <li>
              Notify RMA through its support channel if you suspect unauthorized
              account activity.
            </li>
            <li>
              Do not impersonate another person or register using misleading
              information.
            </li>
          </ul>

          <p>
            You are responsible for activity performed through your account,
            subject to applicable law and any security failures or
            responsibilities attributable to RMA.
          </p>
        </section>

        <section className="terms_section">
          <h2>3. Finding Shops and Product Availability</h2>

          <p>
            Shops displayed on RMA may depend on your selected shop, location,
            service area, and the information available on the platform.
          </p>

          <p>
            A shop appearing on RMA does not guarantee that every listed product
            is available at all times. Availability may change because of stock,
            preparation capacity, business hours, or other operational
            circumstances.
          </p>

          <p>
            Customers should review the selected shop, product details,
            quantities, prices, and fulfilment option before submitting an
            order.
          </p>
        </section>

        <section className="terms_section">
          <h2>4. Placing and Accepting Orders</h2>

          <p>
            Placing an order is a request to purchase products from the selected
            shop. Submission of an order does not necessarily mean that the shop
            has accepted it.
          </p>

          <p>
            The shop may need to review the order, confirm product availability,
            and prepare the requested items. Order status displayed on RMA
            should be used to follow the order's progress.
          </p>

          <p>
            If a shop cannot fulfil an order, the order may be rejected,
            cancelled, or otherwise updated through the applicable workflow. Any
            payment already made must be handled according to the actual payment
            arrangement and applicable refund rules.
          </p>

          <p>
            Please review order details carefully before confirming your
            request. If an order contains an error, contact the shop or RMA
            support promptly.
          </p>
        </section>

        <section className="terms_section">
          <h2>5. Product Information, Weight and Quantity</h2>

          <p>
            Participating shops are responsible for the accuracy of their
            product listings, descriptions, availability, and prices.
          </p>

          <p>
            Meat and seafood may be sold by weight, quantity, or another unit
            shown on the product listing. Customers should review the displayed
            unit, quantity, and applicable price before ordering.
          </p>

          <p>
            Where a product is sold by weight, the final quantity or weight may
            vary within the normal and lawful limits applicable to that product
            and transaction. Any material price or quantity change should be
            handled transparently and in accordance with applicable law and the
            agreed order.
          </p>

          <p>
            Product images are for reference and may not show the exact
            appearance of every individual item. This does not remove a shop's
            obligations concerning accurate descriptions, product quality,
            safety, or consumer rights.
          </p>
        </section>

        <section className="terms_section">
          <h2>6. Prices, Delivery Charges and Other Fees</h2>

          <p>
            Product prices are generally set by the participating shop and
            displayed on the platform. Applicable delivery charges and other
            disclosed charges may depend on the order, location, and selected
            service.
          </p>

          <p>
            Before placing an order, review the total amount shown in the order
            summary or checkout flow. If a charge is unclear, contact RMA
            support before proceeding.
          </p>

          <p>
            Shop prices and service charges may change over time. A change
            should not be used to retroactively alter an already confirmed order
            except where the change is agreed to or otherwise permitted by
            applicable law.
          </p>
        </section>

        <section className="terms_section">
          <h2>7. Customer Payments and Payment Verification</h2>

          <p>
            Under RMA's current customer payment workflow, the product payment
            is made directly to the selected shop using the shop's provided
            payment details or UPI QR code, as applicable.
          </p>

          <p>
            Customers should verify the recipient and amount before authorizing
            a payment. A payment initiated by the customer may still be pending,
            unsuccessful, or incorrectly directed. Keep the relevant transaction
            reference or receipt until the order is resolved.
          </p>

          <p>
            The shop is responsible for checking its own payment account and
            verifying receipt of the product payment. An order status on RMA
            should not be treated as conclusive proof of a bank or UPI
            transaction unless the platform specifically confirms that
            transaction through an implemented verification process.
          </p>

          <p>
            RMA may separately collect platform fees from participating shops
            under the applicable shop agreement. Such shop fees are distinct
            from the customer's payment for products.
          </p>

          <p>
            Never share your UPI PIN, banking password, one-time password, or
            other payment authentication secret with a shop representative or
            anyone claiming to provide RMA support.
          </p>
        </section>

        <section className="terms_section">
          <h2>8. Delivery and Pickup</h2>

          <p>
            Delivery and pickup options depend on the selected shop, service
            area, order conditions, and operational availability.
          </p>

          <p>
            Estimated delivery times are estimates only and may be affected by
            order preparation, traffic, weather, distance, demand, access to the
            delivery address, or other circumstances.
          </p>

          <p>
            Customers should provide a complete and accurate delivery address, a
            reachable contact number, and any useful delivery instructions
            requested by the platform.
          </p>

          <p>
            Where pickup is selected, customers should follow the shop's
            applicable collection instructions and confirm the order details
            before leaving.
          </p>
        </section>

        <section className="terms_section">
          <h2>9. Delivery Partners</h2>

          <p>
            Where delivery is available, an order may be assigned to a delivery
            partner or handled through another supported delivery arrangement.
          </p>

          <p>
            Assignment, estimated arrival, and delivery status may change as an
            order progresses. RMA may provide order updates through the features
            available in the platform.
          </p>

          <p>
            Customers should cooperate reasonably with delivery arrangements and
            avoid giving unsafe, unlawful, or misleading instructions. Customers
            should not request a delivery partner to perform activities
            unrelated to the delivery that would create a safety or legal
            concern.
          </p>
        </section>

        <section className="terms_section">
          <h2>10. Cancellations and Changes</h2>

          <p>
            Whether an order can be cancelled or changed may depend on its
            current status, whether the shop has accepted or started preparing
            it, and the applicable order rules.
          </p>

          <p>
            If cancellation or modification is available in RMA, use the
            provided option. Otherwise, contact the shop or RMA support as soon
            as possible. A request does not mean that the cancellation or change
            has been approved.
          </p>

          <p>
            Any cancellation charge, refund, or other consequence must be
            consistent with the terms disclosed for the transaction and
            applicable law. Nothing in this section removes a consumer right
            that cannot lawfully be excluded.
          </p>
        </section>

        <section className="terms_section">
          <h2>11. Order Problems, Complaints and Refunds</h2>

          <p>
            If you receive an incorrect, missing, damaged, materially
            misdescribed, or undelivered order, report the issue to RMA support
            promptly and provide the order reference and relevant details.
          </p>

          <p>
            RMA may help communicate with the shop or delivery partner and
            review the available order information. The appropriate resolution
            depends on the facts, the payment arrangement, the responsibilities
            of the parties, and applicable law.
          </p>

          <p>
            Because the customer currently pays the shop directly for products,
            a product-payment refund may need to be issued by the shop through
            the applicable payment method. RMA support may assist with
            coordination, but a refund should not be considered completed until
            the responsible party has actually processed it.
          </p>

          <p>
            Any refund or replacement remains subject to applicable consumer
            protection laws and any valid, clearly disclosed policy. Contacting
            support does not guarantee a particular outcome, but complaints
            should be reviewed fairly.
          </p>
        </section>

        <section className="terms_section">
          <h2>12. Fresh Meat and Seafood Safety</h2>

          <p>
            Meat and seafood are perishable products. Shops are responsible for
            complying with applicable food safety, hygiene, storage, handling,
            packaging, and other legal requirements relating to the products
            they sell.
          </p>

          <p>
            Customers should inspect the delivered products promptly and follow
            appropriate food-safety and storage guidance. If a product appears
            spoiled, contaminated, damaged, or unsafe, do not consume it.
          </p>

          <p>
            Report suspected product safety issues to the shop and RMA support
            promptly. Where appropriate, preserve the order details and relevant
            evidence and seek assistance from the relevant authority or a
            qualified professional.
          </p>

          <p>
            Nothing in these terms limits any rights or remedies available under
            applicable food safety or consumer protection law.
          </p>
        </section>

        <section className="terms_section">
          <h2>13. Customer Responsibilities</h2>

          <ul>
            <li>
              Provide accurate account, contact, and delivery information.
            </li>
            <li>
              Review the selected shop, products, quantities, prices, and
              charges.
            </li>
            <li>
              Use payment details carefully and verify the intended recipient.
            </li>
            <li>Remain reasonably reachable during delivery when necessary.</li>
            <li>Provide lawful and reasonable delivery instructions.</li>
            <li>Report order issues honestly and promptly.</li>
            <li>
              Use RMA for lawful purposes and comply with applicable laws.
            </li>
          </ul>
        </section>

        <section className="terms_section">
          <h2>14. Prohibited Activities</h2>

          <p>You must not use RMA to:</p>

          <ul>
            <li>Commit fraud or other unlawful activity.</li>
            <li>
              Submit intentionally false orders or misleading information.
            </li>
            <li>
              Abuse complaints, refunds, promotions, or support processes.
            </li>
            <li>
              Impersonate another person or misuse another person's account.
            </li>
            <li>Attempt unauthorized access to accounts, systems, or data.</li>
            <li>
              Interfere with the security, integrity, or operation of the
              platform.
            </li>
            <li>
              Harass, threaten, or endanger customers, shop owners, delivery
              partners, or support staff.
            </li>
          </ul>
        </section>

        <section className="terms_section">
          <h2>15. Shop Responsibilities</h2>

          <p>
            Participating shops are responsible for their product listings,
            pricing, availability, lawful operation, product handling, and
            fulfilment of accepted orders.
          </p>

          <p>
            Shops must comply with applicable licensing, food safety, consumer
            protection, tax, and other legal requirements relevant to their
            operations.
          </p>

          <p>
            Shops may also be subject to separate RMA owner terms, platform fee
            arrangements, onboarding requirements, and operational policies.
            Those requirements supplement these customer terms where applicable.
          </p>
        </section>

        <section className="terms_section">
          <h2>16. Platform Availability and Changes</h2>

          <p>
            RMA aims to provide a reliable service but does not guarantee that
            every feature will always be available, uninterrupted, or
            error-free.
          </p>

          <p>
            Temporary interruptions may occur because of maintenance, technical
            issues, network failures, third-party services, or circumstances
            outside reasonable control.
          </p>

          <p>
            RMA may update, modify, or discontinue platform features where
            reasonably necessary. Where a change materially affects users, RMA
            will provide notice when required by applicable law.
          </p>
        </section>

        <section className="terms_section">
          <h2>17. Account Restrictions and Security</h2>

          <p>
            RMA may investigate suspected misuse and may restrict, suspend, or
            terminate access where reasonably necessary to address fraud,
            security risks, unlawful activity, or material violations of these
            terms.
          </p>

          <p>
            Where appropriate and legally permitted, RMA may provide an
            explanation or an opportunity to resolve an issue. Any action will
            remain subject to applicable law and relevant consumer rights.
          </p>
        </section>

        <section className="terms_section">
          <h2>18. Third-Party Services</h2>

          <p>
            Some platform features may depend on services provided by third
            parties, such as mapping, communication, hosting, or payment
            services where implemented.
          </p>

          <p>
            Third-party services may have their own terms and privacy policies.
            RMA does not control every aspect of an independent third party's
            service, but this does not exclude any responsibility that RMA has
            under applicable law.
          </p>
        </section>

        <section className="terms_section">
          <h2>19. Privacy and Personal Information</h2>

          <p>
            RMA handles personal information in accordance with its Privacy
            Policy and applicable law.
          </p>

          <p>
            By using features that require personal information, you acknowledge
            that the information may be used as described in that policy to
            operate accounts, manage orders, coordinate fulfilment, provide
            support, and maintain platform security.
          </p>

          <p>
            Read the{' '}
            <button
              type="button"
              className="terms_inline_link"
              onClick={() => navigate('/privacy')}
            >
              Privacy Policy
            </button>{' '}
            for more information.
          </p>
        </section>

        <section className="terms_section">
          <h2>20. Disclaimers and Responsibility</h2>

          <p>
            RMA provides platform features to support interactions between
            customers and participating shops. Product availability, shop
            operations, and delivery arrangements may involve parties other than
            RMA.
          </p>

          <p>
            RMA does not guarantee that every shop, product listing, estimated
            delivery time, or platform feature will be available at all times.
            However, these terms do not exclude obligations or liabilities that
            cannot lawfully be excluded or restricted.
          </p>

          <p>
            Nothing in these terms removes any applicable statutory consumer
            rights or any responsibility that RMA, a shop, or another party
            cannot legally disclaim.
          </p>
        </section>

        <section className="terms_section">
          <h2>21. Changes to These Terms</h2>

          <p>
            RMA may revise these Terms &amp; Conditions as the platform,
            services, or applicable legal requirements change.
          </p>

          <p>
            The updated version will display its revised date. Where required by
            law, RMA will provide notice or obtain renewed acceptance before
            applying material changes.
          </p>

          <p>
            Your continued use of RMA after updated terms take effect will be
            governed by the revised terms to the extent permitted by applicable
            law.
          </p>
        </section>

        <section className="terms_section">
          <h2>22. Governing Law and Disputes</h2>

          <p>
            These terms are subject to the laws applicable to the relevant RMA
            service and transaction. Any dispute will be handled through the
            dispute-resolution procedures and courts or authorities that have
            jurisdiction under applicable law.
          </p>

          <p>
            This section does not remove any mandatory consumer protection or
            other legal rights that apply to you.
          </p>
        </section>

        <section className="terms_section">
          <h2>23. Contact and Support</h2>

          <p>
            For questions about these terms, an order, a payment, a delivery, or
            another RMA service, contact RMA through the Help &amp; Support
            section.
          </p>

          <p>
            When contacting support about an order, include the relevant order
            reference and a clear description of the issue. Do not send
            passwords, UPI PINs, or other payment authentication secrets.
          </p>
        </section>

        <section className="terms_contact">
          <h2>Need help?</h2>

          <p>
            If you have a question about an order, account, payment, or RMA
            service, visit our support section.
          </p>

          <button
            type="button"
            onClick={() => navigate('/profile/help-support')}
          >
            Visit Help &amp; Support
          </button>
        </section>
      </div>
    </main>
  );
}

export default Terms;
