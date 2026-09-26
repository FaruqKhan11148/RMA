function PaymentAmount({ amount }) {
  return (
    <section className="payment_amount">
      <p>Total Amount</p>

      <h2>₹{amount}</h2>
    </section>
  );
}

export default PaymentAmount;
