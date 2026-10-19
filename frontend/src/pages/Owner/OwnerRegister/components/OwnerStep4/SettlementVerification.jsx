function SettlementVerification() {
  return (
    <section className="settlement_section">
      <h2>UPI Payment Verification</h2>

      <div className="settlement_steps">
        <div className="settlement_step">
          <span>1</span>

          <div>
            <strong>Submit UPI Details</strong>

            <p>
              Provide your UPI ID, UPI-linked mobile number, and account holder
              name during shop registration.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>2</span>

          <div>
            <strong>RMA Verification</strong>

            <p>
              An RMA administrator will review your submitted shop and UPI
              details before approval.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>3</span>

          <div>
            <strong>UPI Details Confirmation</strong>

            <p>
              Ensure your UPI ID and account details are accurate. RMA may
              require additional verification before enabling payments or
              settlements.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>4</span>

          <div>
            <strong>Settlement Activation</strong>

            <p>
              Once the required verification and payment setup are complete,
              eligible settlements can be enabled according to RMA's payment
              process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettlementVerification;
