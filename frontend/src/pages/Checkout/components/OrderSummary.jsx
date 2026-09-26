function OrderSummary({
  cartItems,
  totalPrice,
  orderType,
  deliveryLoading,
  deliveryCharge,
  paymentMethod,
  payuPricing,
}) {
  return (
    <section className="checkout_summary_card">
      <div className="checkout_summary_header">
        <div>
          <h2>Order Summary</h2>
        </div>
      </div>

      <div className="checkout_summary_items">
        {cartItems.map((item) => (
          <div className="summary_item" key={item.product.productId}>
            <div className="summary_item_info">
              <strong>{item.product.name}</strong>

              <span>
                {item.quantity} × ₹{item.product.price}
              </span>
            </div>

            <strong className="summary_item_price">
              ₹{item.product.price * item.quantity}
            </strong>
          </div>
        ))}
      </div>

      <div className="checkout_summary_divider" />

      <div className="summary_row">
        <span>Item Total</span>

        <strong>₹{totalPrice}</strong>
      </div>

      <div className="summary_row summary_delivery_row">
        <div className="summary_delivery_label">
          <span>Delivery Charge</span>
        </div>

        <strong>
          {orderType === 'delivery'
            ? deliveryLoading
              ? 'calculating...'
              : `₹${deliveryCharge.toFixed(2)}`
            : 'Free'}
        </strong>
      </div>

      {paymentMethod === 'ONLINE' && (
        <div className="summary_row summary_payu_row">
          <div className="summary_payu_label">
            <span>Convenience Charge</span>
          </div>

          <strong>₹{payuPricing.payuCharges.toFixed(2)}</strong>
        </div>
      )}

      <div className="checkout_summary_divider" />

      <div className="summary_total">
        <span>Final Customer Total</span>

        <strong>
          {deliveryLoading
            ? 'Calculating...'
            : `₹${payuPricing.customerPayableAmount.toFixed(2)}`}
        </strong>
      </div>
    </section>
  );
}

export default OrderSummary;
