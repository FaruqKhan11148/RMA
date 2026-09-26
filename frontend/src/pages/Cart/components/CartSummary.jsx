function CartSummary({ totalItems, totalPrice, onCheckout }) {
  return (
    <section className="cart_summary">
      <div className="cart_summary_header">
        <h2>Order Summary</h2>
      </div>

      <div className="cart_summary_row">
        <span>Items</span>

        <span>{totalItems}</span>
      </div>

      <div className="cart_summary_row">
        <span>Item total</span>

        <strong>₹{totalPrice}</strong>
      </div>

      <div className="cart_summary_divider" />

      <div className="cart_summary_total">
        <span>Total</span>

        <strong>₹{totalPrice}</strong>
      </div>

      <button type="button" className="checkout_button" onClick={onCheckout}>
        <span>Continue to Checkout</span>

        <span>→</span>
      </button>
    </section>
  );
}

export default CartSummary;
