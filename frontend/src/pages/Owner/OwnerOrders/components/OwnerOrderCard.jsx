function OwnerOrderCard({
  order,
  setSelectedOrder,
  handleStatusChange,
  openDeliveryAssignment,
  openRejectionModal,
}) {
  const hasActiveDeliveryAssignment =
    order.orderType === 'delivery' &&
    order.deliveryPersonId &&
    ['PENDING', 'ACCEPTED'].includes(order.deliveryAssignmentStatus);

  const getDeliveryPartnerStatus = () => {
    if (!order.deliveryPersonId) {
      return null;
    }

    if (order.deliveryAssignmentStatus === 'PENDING') {
      return 'Waiting for acceptance';
    }

    if (order.deliveryAssignmentStatus === 'ACCEPTED') {
      return order.status === 'OutForDelivery'
        ? 'Out for delivery'
        : 'Accepted';
    }

    return null;
  };

  const deliveryPartnerStatus = getDeliveryPartnerStatus();

  const isRma =
    order.orderType === 'delivery' &&
    order.deliveryAssignmentType === 'RMA' &&
    order.deliveryPersonId;

  const getDeliveryStatusClass = () => {
    if (order.deliveryAssignmentStatus === 'PENDING') {
      return 'pending';
    }

    if (order.deliveryAssignmentStatus === 'ACCEPTED') {
      return order.status === 'OutForDelivery'
        ? 'out-for-delivery'
        : 'accepted';
    }

    return '';
  };

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

      {/* ORDER META */}

      <div className="owner_order_meta">
        <span>{order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</span>

        {order.orderType === 'delivery' && order.deliveryDistance != null && (
          <span>{Number(order.deliveryDistance).toFixed(2)} KM</span>
        )}
      </div>

      {/* DELIVERY STATUS */}

      {order.orderType === 'delivery' &&
        order.deliveryAssignmentType &&
        order.deliveryPersonId && (
          <div
            className={`owner_order_delivery_partner ${isRma ? 'rma' : 'shop'} ${getDeliveryStatusClass()}`}
          >
            <div className="owner_order_delivery_partner_info">
              <strong>{isRma ? 'RMA Delivery' : 'Shop Delivery'}</strong>

              <span>
                {order.deliveryAssignmentStatus === 'PENDING'
                  ? 'Delivery partner is being contacted'
                  : order.status === 'OutForDelivery'
                    ? 'Delivery partner is out for delivery'
                    : 'Delivery partner accepted the order'}
              </span>
            </div>

            <span className="owner_order_delivery_partner_status">
              {deliveryPartnerStatus}
            </span>
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
              hasActiveDeliveryAssignment ? (
                <span className="order_delivery_message">
                  {order.deliveryAssignmentStatus === 'PENDING'
                    ? 'Waiting for delivery partner acceptance'
                    : 'Delivery partner assigned'}
                </span>
              ) : (
                <button
                  className="accept_order_button"
                  onClick={() => openDeliveryAssignment(order)}
                >
                  Send for Delivery
                </button>
              )
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
