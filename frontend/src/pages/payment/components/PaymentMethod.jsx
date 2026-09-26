function PaymentMethod({ paymentMethod, setPaymentMethod }) {
  return (
    <section className="payment_section">
      <h2>Payment Method</h2>

      <div className="payment_options">
        <button
          type="button"
          className={`payment_option ${
            paymentMethod === 'UPI' ? 'selected' : ''
          }`}
          onClick={() => setPaymentMethod('UPI')}
        >
          <div>
            <strong>UPI</strong>

            <p>Google Pay, PhonePe, Paytm and other UPI apps</p>
          </div>

          {paymentMethod === 'UPI' && <span>✓</span>}
        </button>

        <button
          type="button"
          className={`payment_option ${
            paymentMethod === 'CARD' ? 'selected' : ''
          }`}
          onClick={() => setPaymentMethod('CARD')}
        >
          <div>
            <strong>Debit / Credit Card</strong>

            <p>Pay securely using your bank card</p>
          </div>

          {paymentMethod === 'CARD' && <span>✓</span>}
        </button>

        <button
          type="button"
          className={`payment_option ${
            paymentMethod === 'RUPAY' ? 'selected' : ''
          }`}
          onClick={() => setPaymentMethod('RUPAY')}
        >
          <div>
            <strong>RuPay</strong>

            <p>Pay using a RuPay card</p>
          </div>

          {paymentMethod === 'RUPAY' && <span>✓</span>}
        </button>
      </div>
    </section>
  );
}

export default PaymentMethod;
