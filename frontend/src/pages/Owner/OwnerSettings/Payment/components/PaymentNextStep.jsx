function PaymentNextStep({ onboardingStatus }) {
  if (onboardingStatus === 'VERIFIED') {
    return null;
  }

  return (
    <div className="payment_next_step">
      <div className="payment_next_step_icon">!</div>

      <div>
        <strong>Payment onboarding required</strong>

        <p>
          Your payment account is not fully verified yet. Once Razorpay
          onboarding is connected, this page will allow you to complete the
          required verification steps.
        </p>
      </div>
    </div>
  );
}

export default PaymentNextStep;
