function SummaryValueSkeleton({ width = '72px' }) {
  return (
    <span
      className="summary_value_skeleton"
      style={{ width }}
      aria-hidden="true"
    />
  );
}

function OrderSummary({
  cartItems,
  totalPrice,
  orderType,
  deliveryLoading,
  deliveryCharge,
}) {
  const customerTotal =
    Number(totalPrice || 0) +
    (orderType === 'delivery' ? Number(deliveryCharge || 0) : 0);

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
        <strong>₹{Number(totalPrice || 0).toFixed(2)}</strong>
      </div>

      <div className="summary_row summary_delivery_row">
        <div className="summary_delivery_label">
          <span>Delivery Charge</span>
        </div>

        <strong>
          {orderType !== 'delivery' ? (
            'Free'
          ) : deliveryLoading ? (
            <SummaryValueSkeleton width="78px" />
          ) : (
            `₹${Number(deliveryCharge || 0).toFixed(2)}`
          )}
        </strong>
      </div>

      <div className="checkout_summary_divider" />

      <div className="summary_total">
        <span>Final Customer Total</span>

        <strong>
          {deliveryLoading && orderType === 'delivery' ? (
            <SummaryValueSkeleton width="110px" />
          ) : (
            `₹${customerTotal.toFixed(2)}`
          )}
        </strong>
      </div>
    </section>
  );
}

export default OrderSummary;
