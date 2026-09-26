function PaymentDetailsHeader({ navigate }) {
  return (
    <>
      <button
        type="button"
        className="owner_setting_back"
        onClick={() => navigate(-1)}
      >
        ← Payments Settings
      </button>

      <div className="owner_setting_header">
        <p className="owner_setting_tag">PAYMENT SETTINGS</p>

        <h1>Payment Details</h1>

        <p>View your payment account, KYC and settlement onboarding status.</p>
      </div>
    </>
  );
}

export default PaymentDetailsHeader;
