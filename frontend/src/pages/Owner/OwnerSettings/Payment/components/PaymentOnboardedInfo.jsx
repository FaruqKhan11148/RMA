function PaymentOnboardedInfo({ onboardedAt }) {
  if (!onboardedAt) {
    return null;
  }

  return (
    <div className="payment_onboarded_info">
      <span>Onboarded On</span>

      <strong>{new Date(onboardedAt).toLocaleString()}</strong>
    </div>
  );
}

export default PaymentOnboardedInfo;
