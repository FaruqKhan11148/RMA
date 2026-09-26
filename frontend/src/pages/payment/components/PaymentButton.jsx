function PaymentButton({ loading, amount, onPayment }) {
  return (
    <button className="pay_button" onClick={onPayment} disabled={loading}>
      {loading ? 'Loading Payment...' : `Pay ₹${amount}`}
    </button>
  );
}

export default PaymentButton;
