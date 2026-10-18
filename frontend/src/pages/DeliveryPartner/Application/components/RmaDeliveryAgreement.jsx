import { useEffect, useRef, useState } from 'react';
import './RmaDeliveryAgreement.css';

const AGREEMENT_VERSION = 'RMA-DP-1.0';

function RmaDeliveryAgreement({
  accepted,
  accepting,
  error,
  onAccept,
  onBack,
}) {
  const agreementBodyRef = useRef(null);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setHasReadToBottom(false);
    setConfirmed(false);

    const element = agreementBodyRef.current;
    if (!element) return;

    const checkScroll = () => {
      const reachedBottom =
        element.scrollHeight <= element.clientHeight + 2 ||
        element.scrollTop + element.clientHeight >= element.scrollHeight - 2;

      if (reachedBottom) setHasReadToBottom(true);
    };

    checkScroll();
    element.addEventListener('scroll', checkScroll);

    return () => element.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <section className="rma_dp_agreement_page">
      <button type="button" className="rma_dp_agreement_back" onClick={onBack}>
        ← Back to application
      </button>

      <header className="rma_dp_agreement_header">
        <p className="rma_dp_agreement_eyebrow">RMA DELIVERY PARTNER</p>
        <h1>Delivery Partner Agreement</h1>
        <p>
          Please read the terms carefully before accepting and submitting your
          application.
        </p>
        <span className="rma_dp_agreement_version">
          Agreement version: {AGREEMENT_VERSION}
        </span>
      </header>

      <div className="rma_dp_agreement_scroll_hint">
        Read the agreement below and scroll to the end to continue.
      </div>

      <div
        className="rma_dp_agreement_body"
        ref={agreementBodyRef}
        tabIndex={0}
        aria-label="RMA Delivery Partner Agreement terms"
      >
        <h2>1. Purpose and relationship</h2>
        <p>
          This agreement describes the basic terms for providing delivery
          services through Raw Meat Application (RMA). By accepting, you confirm
          that you have read these terms and agree to follow the applicable RMA
          delivery procedures. Your application remains subject to RMA review
          and approval.
        </p>
        <p>
          This agreement does not guarantee a minimum number of orders,
          earnings, working hours, or continued access to the platform. The
          legal nature of the working relationship will be subject to applicable
          law and any additional written terms provided by RMA.
        </p>

        <h2>2. Registration and accurate information</h2>
        <p>
          You must provide accurate personal, address, identity, driving
          licence, vehicle, and payment details, along with the documents
          requested during registration. You must promptly update expired,
          changed, or incorrect information. RMA may review your application and
          request corrections or additional verification before approval.
        </p>
        <p>
          You must not use another person's identity, driving licence, vehicle
          documents, or payment account, or submit altered or misleading
          information.
        </p>

        <h2>3. Orders and delivery expectations</h2>
        <p>
          RMA may offer delivery assignments based on factors such as
          availability, location, order details, and operational requirements.
          You may be expected to work toward a target of up to 30 deliveries per
          day when sufficient suitable orders are available. This is a target,
          not a guarantee of orders and not an unconditional requirement to
          complete 30 deliveries when orders are unavailable.
        </p>
        <p>
          You may handle up to six active orders at a time, subject to the
          platform's assignment rules and your ability to complete them safely
          and correctly. Do not accept assignments that you cannot reasonably
          fulfil. Follow the displayed pickup, delivery, status, and customer
          verification steps.
        </p>

        <h2>4. Pickup and payment confirmation</h2>
        <p>
          For orders using RMA's manual shop-payment process, the shop may be
          required to pay the delivery charge plus the applicable RMA platform
          fee through the designated RMA payment method. For example, if the
          item subtotal is ₹260 and the delivery charge is ₹40, a 2.5% platform
          fee on the item subtotal is ₹6.50, making the shop payment ₹46.50.
          Actual charges must follow the amount shown for that order.
        </p>
        <p>
          A shop saying that it has sent payment, or marking payment as sent, is
          not proof that RMA has received it. Do not collect the package under
          this manual process until the required payment has been verified and
          confirmed by RMA through its authorised process. Follow the order's
          current instructions if the payment method changes.
        </p>

        <h2>5. Handling and delivering packages</h2>
        <p>
          Collect the correct package and handle it carefully. Do not open,
          tamper with, replace, remove, consume, or otherwise interfere with any
          item in the package. Deliver it as packed by the shop, subject to
          applicable safety and legal requirements.
        </p>
        <p>
          Keep packages secure during transport. At delivery, follow the
          authorised customer verification process, including entering the
          delivery OTP when required. Mark an order completed only after it has
          actually been delivered according to the applicable process.
        </p>
        <p>
          If a package is missing, damaged, incorrectly packed, delayed, or
          cannot be delivered, report the issue promptly through the designated
          RMA process. Do not conceal an incident or mark an undelivered order
          as complete.
        </p>

        <h2>6. Customer conduct and privacy</h2>
        <p>
          Treat customers, shop owners, and other delivery partners
          respectfully. Do not harass, threaten, discriminate against, or
          mislead anyone. Never misuse customer phone numbers, addresses, order
          details, OTPs, identity documents, or other personal information. Use
          such information only as necessary to complete authorised delivery
          work.
        </p>
        <p>
          Do not share customer information outside the authorised delivery
          process or use it for personal marketing or unrelated contact. Follow
          applicable privacy, food-handling, road-safety, and other legal
          requirements.
        </p>

        <h2>7. Location and availability</h2>
        <p>
          When you are online or completing an active delivery, RMA may use
          location information for assignment, navigation, delivery operations,
          and safety, as described in its applicable privacy notice and device
          permissions. Location use must follow the disclosed purpose and
          applicable law. This clause does not authorise unrestricted tracking
          outside disclosed operational periods.
        </p>
        <p>
          Keep your availability and order status accurate. Do not falsely
          report your location, pickup, arrival, or delivery progress.
        </p>

        <h2>8. Costs and earnings</h2>
        <p>
          Unless a separate written RMA policy says otherwise, you are
          responsible for your ordinary operating expenses, including fuel,
          mobile data, and routine vehicle costs. Additional fuel reimbursement
          or expense payments are not promised by this agreement.
        </p>
        <p>
          Delivery earnings and other payable amounts must be calculated from
          the applicable order records and RMA ledger. The wallet may
          distinguish earned, pending, available, withdrawal requested, and paid
          amounts. An amount displayed as pending or otherwise ineligible is not
          automatically available for withdrawal.
        </p>

        <h2>9. Withdrawals and payment details</h2>
        <p>
          You may request withdrawal of an amount greater than ₹0 up to your
          eligible available balance, subject to verification and applicable
          withdrawal rules. You may leave funds in your wallet instead of
          requesting a withdrawal. RMA may review the ledger and transaction
          records before processing a request.
        </p>
        <p>
          Withdrawals will be sent to the verified bank account or UPI
          destination recorded for your account. You are responsible for
          providing accurate payment details. A withdrawal request is not
          confirmation that payment has been completed; the status should change
          when the payment is processed and recorded.
        </p>

        <h2>10. Missing, lost, or damaged packages</h2>
        <p>
          Any allegation of loss, theft, tampering, or damage must be reviewed
          fairly using relevant evidence, including pickup records, order
          details, messages, photographs, and statements from the people
          involved. You will have a reasonable opportunity to explain your
          account of the incident.
        </p>
        <p>
          No automatic deduction of the full order or package value applies
          solely because an allegation has been made. Any responsibility or
          recovery must be based on the findings, the applicable written policy,
          and the law. RMA should communicate the reason and calculation for any
          authorised adjustment.
        </p>

        <h2>11. Safety and prohibited conduct</h2>
        <p>
          Follow traffic laws, wear required safety equipment, maintain a
          roadworthy vehicle, and never use your phone in a way that makes
          driving unsafe. Do not drive under the influence of alcohol or drugs.
          Do not falsify delivery records, misuse OTPs, collect unauthorised
          payments, or deliberately interfere with order or wallet records.
        </p>

        <h2>12. Complaints, review, and access</h2>
        <p>
          Raise delivery, payment, customer, or shop-related disputes through
          the designated RMA support or review process and provide truthful
          supporting information. RMA may investigate reported violations and
          may restrict assignments or access when reasonably necessary, subject
          to applicable law and relevant review procedures.
        </p>
        <p>
          You may contact RMA through its officially provided support channel to
          raise a concern or request clarification about an order, ledger entry,
          withdrawal, or decision.
        </p>

        <h2>13. Agreement version and acknowledgement</h2>
        <p>
          Your acceptance is recorded against the version shown at the top of
          this agreement, together with an acceptance timestamp. If RMA
          introduces a materially updated agreement, it may ask you to review
          and accept the new version before continuing under the updated terms.
        </p>
        <p>
          By accepting, you confirm that you have read and understood these
          terms, that the information you submitted is accurate to the best of
          your knowledge, and that you agree to follow these terms and
          applicable law.
        </p>

        <p className="rma_dp_agreement_final_note">
          End of RMA Delivery Partner Agreement — {AGREEMENT_VERSION}
        </p>
      </div>

      <div className="rma_dp_agreement_acceptance">
        {hasReadToBottom ? (
          <label className="rma_dp_agreement_checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={accepted || accepting}
            />
            <span>
              I have read and agree to the RMA Delivery Partner Agreement,
              version {AGREEMENT_VERSION}.
            </span>
          </label>
        ) : (
          <p className="rma_dp_agreement_read_notice">
            Scroll to the end of the agreement to enable acceptance.
          </p>
        )}

        {error && <p className="rma_dp_agreement_error">{error}</p>}

        {accepted ? (
          <div className="rma_dp_agreement_saved">
            Agreement acceptance is saved.
          </div>
        ) : (
          <button
            type="button"
            className="rma_dp_agreement_accept_button"
            onClick={onAccept}
            disabled={!hasReadToBottom || !confirmed || accepting}
          >
            {accepting ? 'Saving acceptance...' : 'Agree and Continue'}
          </button>
        )}
      </div>
    </section>
  );
}

export default RmaDeliveryAgreement;
