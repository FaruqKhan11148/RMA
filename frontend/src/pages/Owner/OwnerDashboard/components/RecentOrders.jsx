function RecentOrders({ orders }) {
  return (
    <section className="owner_orders_section">
      <div className="owner_section_header">
        <div>
          <h2>Recent Orders</h2>

          <span>Latest customer orders</span>
        </div>
      </div>

      <div className="owner_orders">
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.slice(0, 5).map((order) => (
            <div className="owner_order_card compact" key={order.orderId}>
              <div className="owner_order_top">
                <strong>#{order.orderId}</strong>

                <span className={`order_status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <p>{order.customer.name}</p>

              <div className="compact_order_bottom">
                <span>
                  {order.totalItems} item
                  {order.totalItems > 1 ? 's' : ''}
                </span>

                <strong>₹{order.totalPrice}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default RecentOrders;
