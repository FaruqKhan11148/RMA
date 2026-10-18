import './OwnerTerms.css';
import { useRef, useState } from 'react';

function OwnerTerms({ onAccept, onClose }) {
  const documentRef = useRef(null);

  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleDocumentScroll = () => {
    const element = documentRef.current;
    if (!element) return;

    const reachedBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 5;

    if (reachedBottom) {
      setHasReachedBottom(true);
    }
  };

  const handleAcceptTerms = () => {
    if (!hasReachedBottom || !termsAccepted) return;

    onAccept();
  };

  return (
    <main className="owner_terms_page">
      <div className="owner_terms_container">
        <header className="owner_terms_header">
          <button
            type="button"
            className="owner_terms_close_button"
            onClick={onClose}
            aria-label="Close agreement"
          >
            ×
          </button>
          <p className="owner_terms_brand">RMA — Raw Meat Application</p>
          <h1>Shop Owner Agreement</h1>
          <p>
            Terms governing shop registration, order fulfilment, payments,
            platform fees, and the use of RMA services.
          </p>
          <p className="owner_terms_updated">Effective date: 18 October 2026</p>
        </header>

        <div
          ref={documentRef}
          className="owner_terms_document"
          onScroll={handleDocumentScroll}
        >
          <section className="owner_terms_section">
            <h2>1. Agreement and acceptance</h2>
            <p>
              This Shop Owner Agreement applies to shop owners who register for
              or use RMA services. By registering and accepting this Agreement,
              you confirm that you have read and understood its terms and agree
              to follow them.
            </p>
            <p>
              If you register on behalf of a business, you confirm that you are
              authorised to accept these terms for that business.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>2. Eligibility and registration</h2>
            <p>
              A shop may register on RMA through an authorised RMA helper or
              through a referral from an existing RMA shop owner. A referral
              does not guarantee approval or registration.
            </p>
            <ul>
              <li>
                You must provide accurate, complete, and up-to-date shop and
                owner information.
              </li>
              <li>
                You must provide a valid mobile number and any other required
                details.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You must promptly update RMA if your shop details, payment
                details, or operating status change.
              </li>
              <li>
                You must not impersonate another shop, misuse referral details,
                or submit false information.
              </li>
              <li>
                You remain responsible for your shop's activities conducted
                through your account.
              </li>
            </ul>
          </section>

          <section className="owner_terms_section">
            <h2>3. Licences and legal compliance</h2>
            <p>
              You are responsible for obtaining and maintaining all
              registrations, licences, and approvals required to operate your
              business and sell the products you list, including applicable
              FSSAI registration or licensing requirements.
            </p>
            <p>
              You must comply with applicable food safety, hygiene, packaging,
              labelling, consumer protection, tax, and other relevant laws. You
              must not list or sell products that you are not legally permitted
              to sell.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>4. Products, prices, and availability</h2>
            <ul>
              <li>
                You are responsible for the accuracy of product names, prices,
                units, descriptions, and images you provide.
              </li>
              <li>You must keep product availability and prices updated.</li>
              <li>
                Products supplied must match the customer's confirmed order.
              </li>
              <li>
                You must not list unsafe, prohibited, misleading, or unlawfully
                sourced products.
              </li>
              <li>
                You are responsible for the quality, freshness, handling, and
                lawful supply of products sold by your shop.
              </li>
            </ul>
          </section>

          <section className="owner_terms_section">
            <h2>5. Orders and fulfilment</h2>
            <p>
              When a customer places an order through your RMA shop page, you
              must review the order and verify that the required payment has
              been received before accepting it. You must keep the order status
              accurate throughout fulfilment.
            </p>
            <ul>
              <li>
                After verifying payment, accept the order through the owner
                interface.
              </li>
              <li>
                Prepare the correct products, quantities, and units in
                accordance with the confirmed order.
              </li>
              <li>
                Maintain appropriate hygiene, freshness, packaging, and
                food-safety standards.
              </li>
              <li>
                Update the order status honestly as preparation progresses.
              </li>
              <li>
                Mark the order ready for delivery only when it is actually
                prepared and ready for collection.
              </li>
              <li>
                Do not falsely mark an order as accepted, prepared, dispatched,
                or completed.
              </li>
            </ul>
            <p>
              If an order cannot be fulfilled, you must update its status
              promptly and cooperate in resolving the issue with the customer.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>6. Customer payments and refunds</h2>
            <p>
              Under RMA's current payment arrangement, the customer pays the
              shop directly for the products using the shop's displayed UPI
              details or payment QR code. Before paying, the customer should
              verify the recipient's displayed name and payment details.
            </p>
            <p>
              You must verify successful receipt of the actual payment in your
              UPI or bank application, such as Google Pay, PhonePe, or another
              supported application. A screenshot, payment confirmation shown
              only on the customer's device, or scanned QR code is not by itself
              sufficient proof that the payment reached your account.
            </p>
            <p>
              You should accept and begin preparing an order only after
              verifying that the required payment has been received. You are
              responsible for handling product-payment disputes, cancellations,
              and refunds in accordance with applicable law and the customer
              terms.
            </p>
            <p>
              RMA does not receive or hold the customer's product payment under
              this current arrangement. Any future change to this payment model
              will be communicated under the applicable updated terms.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>7. RMA platform fee and daily settlement</h2>
            <p>
              RMA charges a platform fee of 2.5% of the product subtotal for
              each successfully completed eligible order. The delivery charge is
              excluded from this calculation.
            </p>

            <p>
              An order becomes eligible for this fee only after the delivery
              partner successfully delivers the order and the required customer
              delivery OTP is verified, causing the order to be marked Completed
              in RMA.
            </p>

            <p>
              For example, if the product subtotal is ₹260 and the delivery
              charge is ₹40, the platform fee is calculated on ₹260 only: ₹260 ×
              2.5% = ₹6.50. The ₹40 delivery charge is excluded.
            </p>

            <p>
              If 10 eligible orders are completed with a product subtotal of
              ₹260 each, the eligible product subtotal is ₹2,600 and the
              platform fee is ₹65.
            </p>

            <p>
              RMA may display a daily platform-fee summary and payment reminder
              in the owner's account after the shop's closing time. The summary
              will show the applicable completed orders and the total fee owed
              for those orders.
            </p>

            <p>
              The owner must pay the displayed fee using the payment method
              provided by RMA, such as RMA's verified UPI ID or payment QR code,
              and should verify the recipient details before making payment. A
              payment reminder does not mean that money has been automatically
              deducted from the owner's account.
            </p>

            <p>
              Cancelled, rejected, or undelivered orders that have not reached
              the qualifying Completed status are not subject to this completed-
              order fee. Any correction to an order's status or fee calculation
              must be handled through RMA's reconciliation process.
            </p>

            <p>
              The owner is responsible for paying valid platform fees owed to
              RMA. RMA will communicate the applicable payment instructions,
              reconciliation process, and due dates. Any change to the fee rate
              will be communicated before it takes effect.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>8. Daily completed-order reward</h2>
            <p>
              RMA offers eligible shop owners a daily reward when they complete
              at least 25 qualifying orders during a single shop operating day,
              measured from the shop's opening time to its closing time.
            </p>
            <p>
              Once the minimum threshold of 25 qualifying completed orders is
              reached, the reward is calculated at ₹1.66 per qualifying
              completed order for that operating day. For example, 25 qualifying
              orders result in a reward of ₹41.50, while 30 qualifying orders
              result in a reward of ₹49.80.
            </p>
            <p>
              Only orders that satisfy RMA's completed-order requirements,
              including successful delivery and required customer OTP
              verification, count toward this reward. Cancelled, rejected,
              fraudulent, or unsuccessfully delivered orders do not qualify.
            </p>
            <p>
              Rewards are subject to order verification, eligibility checks, and
              the availability of a verified payout method. Eligible rewards
              will be credited to the owner's verified UPI account through RMA's
              applicable payout process. RMA may publish additional operational
              rules for reward calculation, payout timing, corrections, and
              disputes.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>9. Shop referral reward</h2>
            <p>
              An eligible existing shop owner may refer a new shop to RMA using
              their unique referral ID. The referral must be correctly recorded
              during the new shop's registration and must satisfy RMA's
              eligibility and verification requirements.
            </p>
            <p>
              The referral qualification period is 20 days, beginning on the
              date specified by RMA when the referral is activated. During this
              period, both the referring shop and the referred shop must remain
              active and satisfy RMA's applicable minimum completed-order
              requirements. The specific thresholds and qualification rules must
              be communicated by RMA before the referral period begins.
            </p>
            <p>
              If the referral qualifies, the referring owner receives a reward
              equal to 20% of the eligible RMA platform fees earned from the
              referred shop's qualifying completed orders during the 20-day
              period. The reward is calculated from eligible RMA platform fees,
              not from the referred shop's total sales or product subtotal.
            </p>
            <p>
              For example, if the referred shop generates ₹700 in eligible RMA
              platform fees during the qualification period, the referring owner
              earns a reward of ₹140, representing 20% of ₹700.
            </p>
            <p>
              The referral reward is payable after the 20-day qualification
              period, once both shops' eligibility, qualifying orders, and
              eligible platform fees have been verified. Payment will be made
              through RMA's applicable verified payout process.
            </p>
            <p>
              Self-referrals, duplicate or fraudulent registrations, manipulated
              orders, and activity intended to obtain rewards improperly are not
              eligible. RMA may withhold or reverse rewards credited in error or
              obtained through fraud, subject to applicable law.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>10. RMA delivery partners and order handover</h2>
            <p>
              When an order is ready, you may select the RMA delivery option and
              request a delivery partner through the RMA owner interface. RMA
              Dispatch may search for nearby eligible delivery partners and
              offer the delivery assignment to an available partner.
            </p>
            <p>
              A delivery partner must accept the assignment before proceeding to
              collect the order. You must hand over the correct order and
              cooperate with reasonable pickup verification procedures.
            </p>
            <p>
              Under the proposed delivery-charge process, the owner pays the
              agreed delivery charge separately from the customer's product
              payment. The delivery partner may present an approved payment QR
              code at pickup. The owner should verify the recipient details and
              successful payment before treating the charge as paid.
            </p>
            <p>
              The exact delivery-charge payment procedure, payment-failure
              handling, and any alternative arrangement will follow the
              operational instructions published by RMA. A displayed QR code or
              payment screenshot alone is not proof of successful payment.
            </p>
            <p>
              You must not mark an order as delivered or completed on behalf of
              the delivery partner unless the authorised RMA process permits it.
              Orders must follow RMA's required delivery verification process,
              including customer OTP verification where applicable.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>11. Customer complaints and order issues</h2>
            <p>
              You must cooperate in resolving complaints about product quality,
              missing items, incorrect orders, delayed preparation, and other
              matters within your responsibility. You must not misrepresent an
              order's status or refuse legally required remedies.
            </p>
            <p>
              RMA may review order records and relevant information to help
              investigate complaints and prevent misuse of the platform.
            </p>
            <p>
              If a customer reports that payment was made but you cannot verify
              receipt, do not treat the payment as confirmed solely on the basis
              of a screenshot. Resolve the payment status before proceeding with
              the order, and communicate promptly if the order cannot be
              fulfilled.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>12. Shop identity, QR codes, referrals, and promotion</h2>
            <p>
              RMA may provide your registered shop with a shop ID, QR code, or
              shop-specific link. Customers can use these to find your shop,
              view available products, and place orders.
            </p>
            <p>
              You may promote your shop-specific QR code or link through
              WhatsApp, Instagram, other lawful communication channels, and
              printed promotional material such as an A4 sheet displayed outside
              your shop, subject to applicable laws and RMA branding guidelines.
            </p>
            <p>
              Customers may scan the QR code directly or save a photograph of it
              to access your shop later. You are responsible for ensuring that
              the QR code and promotional material identify your shop accurately
              and are not altered to misdirect payments or customers.
            </p>
            <p>
              If you refer another shop owner to RMA, you must not make false
              claims about earnings, guaranteed orders, approval, or benefits.
              Referral rewards are subject to the eligibility conditions in this
              Agreement and RMA's applicable referral rules.
            </p>
            <p>
              You must not misuse RMA's name, branding, QR codes, or platform,
              manipulate orders, or engage in fraudulent or unlawful activity.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>13. Customer information and privacy</h2>
            <p>
              You may access customer information only as needed to process
              orders, arrange delivery or pickup, communicate about an order,
              and meet your legal obligations. You must protect that information
              and must not sell it, disclose it without authorisation, or use it
              for unrelated marketing without a lawful basis.
            </p>
            <p>
              Your use of personal information must comply with applicable
              privacy and data protection laws and RMA's Privacy Policy.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>14. Account suspension and termination</h2>
            <p>
              RMA may restrict, suspend, or terminate access where reasonably
              necessary to investigate suspected fraud, protect users, address
              serious safety or legal concerns, enforce these terms, or respond
              to unlawful activity. Where appropriate and legally permitted, RMA
              will communicate the reason and any available next steps.
            </p>
            <p>
              You may stop using RMA and request account closure through the
              available support process. Closing an account does not remove
              outstanding payment obligations or legal responsibilities.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>15. RMA's role and service availability</h2>
            <p>
              RMA provides digital tools to help shops manage their presence and
              orders. Unless expressly agreed otherwise, each shop remains
              responsible for its products, pricing, food safety, fulfilment,
              and obligations to customers.
            </p>
            <p>
              RMA will make reasonable efforts to maintain the service but does
              not guarantee uninterrupted or error-free availability. Nothing in
              this Agreement excludes a responsibility or liability that cannot
              legally be excluded.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>16. Changes to these terms</h2>
            <p>
              RMA may update this Agreement when operational, legal, or service
              requirements change. Material changes will be communicated
              appropriately and will apply from the stated effective date. Where
              fresh acceptance is legally required, you will be asked to accept
              the updated terms.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>17. Governing law and disputes</h2>
            <p>
              This Agreement is governed by the applicable laws of India.
              Disputes will be handled by the courts or other forums with
              jurisdiction under applicable law.
            </p>
          </section>

          <section className="owner_terms_section">
            <h2>18. Contact and support</h2>
            <p>
              For questions about this Agreement, platform fees, or your shop
              account, contact RMA through the official support contact
              published on the RMA website.
            </p>
          </section>

          <div className="owner_terms_acceptance">
            <label>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                disabled={!hasReachedBottom}
              />
              <span>
                I have read, understood, and agree to the Shop Owner Agreement
                and Privacy Policy.
              </span>
            </label>

            <button
              type="button"
              onClick={handleAcceptTerms}
              disabled={!hasReachedBottom || !termsAccepted}
              className="owner_terms_accept_button"
            >
              Accept &amp; Continue
            </button>
          </div>

          <footer className="owner_terms_footer">
            By accepting this Agreement, you acknowledge that your acceptance
            may be recorded electronically with the applicable agreement version
            and acceptance time.
          </footer>
        </div>
      </div>
    </main>
  );
}

export default OwnerTerms;
