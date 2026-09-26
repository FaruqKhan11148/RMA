function SettlementVerification() {
  return (
    <section className="settlement_section">
      <h2>Settlement Verification</h2>

      <div className="settlement_steps">
        <div className="settlement_step">
          <span>1</span>

          <div>
            <strong>Submit Bank Details</strong>

            <p>
              Your bank account details will be submitted with your shop
              registration.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>2</span>

          <div>
            <strong>RMA Verification</strong>

            <p>
              An RMA administrator will review and approve your settlement
              account.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>3</span>

          <div>
            <strong>PayU Onboarding</strong>

            <p>
              PayU child-merchant onboarding will be connected when the required
              PayU access is enabled.
            </p>
          </div>
        </div>

        <div className="settlement_step">
          <span>4</span>

          <div>
            <strong>Receive Settlements</strong>

            <p>
              Once the settlement account is activated, future eligible
              settlements can be processed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettlementVerification;
