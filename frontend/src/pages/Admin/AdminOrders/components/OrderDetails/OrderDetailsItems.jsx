function OrderDetailsItems({ order }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Order Items</h2>
          <p>
            {order.totalItems} total item
            {order.totalItems === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="admin-order-items">
        {order.items?.map((item) => (
          <div
            className="admin-order-item"
            key={`${item.productId}-${item.productName}`}
          >
            <div>
              <strong>{item.productName}</strong>

              <span>
                {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
              </span>
            </div>

            <strong>
              ₹
              {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                2,
              )}
            </strong>
          </div>
        ))}
      </div>

      <div className="admin-order-total-row">
        <span>Product Total</span>

        <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
      </div>
    </section>
  );
}

export default OrderDetailsItems;
