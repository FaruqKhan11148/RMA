function OwnerOrderCard({
  order,
  setSelectedOrder,
  handleStatusChange,
  openDeliveryAssignment,
  openRejectionModal,
}) {
  return (
    <div className="owner_order_card" onClick={() => setSelectedOrder(order)}>
      {/* TOP */}

      <div className="owner_order_top">
        <strong>#{order.orderId}</strong>

        <span
          className={`order_status ${order.status
            .toLowerCase()
            .replace(/([a-z])([A-Z])/g, '$1-$2')}`}
        >
          {order.status}
        </span>
      </div>

      {/* CUSTOMER */}

      <div className="owner_order_customer">
        <h2>{order.customer.name}</h2>

        <p>{order.customer.phone}</p>
      </div>

      {/* SUMMARY */}

      <div className="owner_order_summary">
        <div>
          <span>Items</span>

          <strong>
            {order.items.reduce(
              (total, item) => total + Number(item.quantity || 0),
              0,
            )}
          </strong>
        </div>

        <div>
          <span>Total</span>

          <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
        </div>
      </div>

      {/* ORDER TYPE */}

      <div className="owner_order_meta">
        <span>{order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</span>

        {order.orderType === 'delivery' && order.deliveryDistance != null && (
          <span>{Number(order.deliveryDistance).toFixed(2)} KM</span>
        )}
      </div>

      {/* DELIVERY PARTNER */}

      {order.orderType === 'delivery' && order.deliveryAssignmentType && (
        <div className="owner_order_delivery_partner">
          <span>
            {order.deliveryAssignmentType === 'RMA'
              ? 'RMA Delivery Partner'
              : 'Shop Delivery Partner'}
          </span>

          {order.deliveryPersonId && <span>Assigned</span>}
        </div>
      )}

      {/* ACTIONS */}

      <div
        className="owner_order_card_footer"
        onClick={(event) => event.stopPropagation()}
      >
        {order.status === 'Pending' && (
          <>
            <button
              className="reject_order_button"
              onClick={() => openRejectionModal(order)}
            >
              Reject
            </button>

            <button
              className="accept_order_button"
              onClick={() => handleStatusChange(order.orderId, 'Accepted')}
            >
              Accept
            </button>
          </>
        )}

        {order.status === 'Accepted' && (
          <button
            className="accept_order_button"
            onClick={() => handleStatusChange(order.orderId, 'Preparing')}
          >
            Start Preparing
          </button>
        )}

        {order.status === 'Preparing' && (
          <button
            className="accept_order_button"
            onClick={() => handleStatusChange(order.orderId, 'Ready')}
          >
            Mark Ready
          </button>
        )}

        {order.status === 'Ready' && (
          <>
            {order.orderType === 'delivery' ? (
              <button
                className="accept_order_button"
                onClick={() => openDeliveryAssignment(order)}
              >
                Send for Delivery
              </button>
            ) : (
              <button
                className="accept_order_button"
                onClick={() => handleStatusChange(order.orderId, 'Completed')}
              >
                Complete Order
              </button>
            )}
          </>
        )}

        {order.status === 'OutForDelivery' && (
          <span className="order_delivery_message">Out for delivery</span>
        )}

        {order.status === 'Completed' && (
          <span className="order_completed_message">✓ Completed</span>
        )}

        {order.status === 'Rejected' && (
          <span className="order_rejected_message">Order rejected</span>
        )}

        <button
          type="button"
          className="owner_order_view_button"
          onClick={() => setSelectedOrder(order)}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

export default OwnerOrderCard;
