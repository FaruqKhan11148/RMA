function NewOrders({ pendingOrders, openRejectModal, updateOrderStatus }) {
  return (
    <section className="owner_orders_section">
      <div className="owner_section_header">
        <div>
          <h2>New Orders</h2>

          <span>
            {pendingOrders.length === 0
              ? 'No orders waiting'
              : `${pendingOrders.length} order${
                  pendingOrders.length > 1 ? 's' : ''
                } waiting for action`}
          </span>
        </div>
      </div>

      <div className="owner_orders">
        {pendingOrders.length === 0 ? (
          <div className="no_pending_orders">
            <strong>No pending orders</strong>

            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          pendingOrders.map((order) => (
            <div className="owner_order_card" key={order.orderId}>
              <div className="owner_order_top">
                <strong>#{order.orderId}</strong>

                <span className="pending_status">{order.status}</span>
              </div>

              <p>Customer: {order.customer.name}</p>

              <div className="owner_order_items">
                {order.items.map((item) => (
                  <p key={item.productId}>
                    {item.productName} × {item.quantity}
                  </p>
                ))}
              </div>

              <strong className="owner_order_total">₹{order.totalPrice}</strong>

              <div className="owner_order_actions">
                <button
                  className="reject_button"
                  onClick={() => openRejectModal(order)}
                >
                  Reject
                </button>

                <button
                  className="accept_button"
                  onClick={() => updateOrderStatus(order.orderId, 'Accepted')}
                >
                  Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default NewOrders;
