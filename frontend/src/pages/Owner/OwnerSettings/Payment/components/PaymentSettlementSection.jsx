function PaymentSettlementSection({ onboardingStatus }) {
  return (
    <div className="payment_section">
      <div className="payment_section_header">
        <div>
          <span className="payment_section_tag">SETTLEMENT</span>

          <h2>Settlement Information</h2>
        </div>
      </div>

      <div className="payment_settlement_card">
        <div className="payment_settlement_icon">
          {onboardingStatus === 'VERIFIED' ? '✓' : '○'}
        </div>

        <div>
          <strong>
            {onboardingStatus === 'VERIFIED'
              ? 'Settlement account is ready'
              : 'Settlement account not ready'}
          </strong>

          <p>
            {onboardingStatus === 'VERIFIED'
              ? 'Your shop can receive settlements through the connected payment account.'
              : 'Complete payment onboarding and verification before settlements can be enabled.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSettlementSection;
