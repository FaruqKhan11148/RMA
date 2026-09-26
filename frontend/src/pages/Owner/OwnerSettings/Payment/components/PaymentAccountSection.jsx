function PaymentAccountSection({ payment, formatStatus, getStatusClass }) {
  return (
    <div className="payment_section">
      <div className="payment_section_header">
        <div>
          <span className="payment_section_tag">ACCOUNT</span>

          <h2>Payment Account</h2>
        </div>

        <span
          className={`payment_status_badge ${getStatusClass(
            payment.onboardingStatus,
          )}`}
        >
          {formatStatus(payment.onboardingStatus)}
        </span>
      </div>

      <div className="payment_detail_list">
        <div className="payment_detail_row">
          <span>Account ID</span>

          <strong>{payment.accountId || 'Not connected'}</strong>
        </div>

        <div className="payment_detail_row">
          <span>Onboarding Status</span>

          <strong>{formatStatus(payment.onboardingStatus)}</strong>
        </div>

        <div className="payment_detail_row">
          <span>KYC Status</span>

          <strong className={getStatusClass(payment.kycStatus)}>
            {formatStatus(payment.kycStatus)}
          </strong>
        </div>

        <div className="payment_detail_row">
          <span>Bank Status</span>

          <strong className={getStatusClass(payment.bankStatus)}>
            {formatStatus(payment.bankStatus)}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default PaymentAccountSection;
