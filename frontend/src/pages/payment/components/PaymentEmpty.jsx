function PaymentEmpty({ onGoHome }) {
  return (
    <main className="payment_empty">
      <h1>Order not found</h1>

      <button onClick={onGoHome}>Go Home</button>
    </main>
  );
}

export default PaymentEmpty;
