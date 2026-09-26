function PaymentProviderCard({ provider }) {
  return (
    <div className="payment_provider_card">
      <div className="payment_provider_icon">₹</div>

      <div className="payment_provider_content">
        <span>Payment Provider</span>

        <strong>{provider}</strong>

        <small>
          Used for processing customer payments and shop settlements.
        </small>
      </div>
    </div>
  );
}

export default PaymentProviderCard;
