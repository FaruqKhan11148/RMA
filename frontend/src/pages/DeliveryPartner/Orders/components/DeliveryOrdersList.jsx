import DeliveryOrderRow from './DeliveryOrderRow';

function DeliveryOrdersList({ orders, activeSection, onSelectOrder }) {
  const getTitle = () => {
    if (activeSection === 'today') {
      return "Today's Orders";
    }

    if (activeSection === 'pending') {
      return 'Pending Deliveries';
    }

    if (activeSection === 'completedToday') {
      return 'Completed Today';
    }

    return 'All Delivered Orders';
  };

  const getEmptyTitle = () => {
    if (activeSection === 'today') {
      return 'No orders today';
    }

    if (activeSection === 'pending') {
      return 'No pending deliveries';
    }

    if (activeSection === 'completedToday') {
      return 'No orders completed today';
    }

    return 'No delivered orders yet';
  };

  const getEmptyMessage = () => {
    if (activeSection === 'today') {
      return 'There are no delivery orders for today.';
    }

    if (activeSection === 'pending') {
      return 'There are currently no orders waiting for delivery.';
    }

    if (activeSection === 'completedToday') {
      return 'No delivery orders have been completed today.';
    }

    return 'There are no completed delivery orders yet.';
  };

  return (
    <section className="delivery_orders_list">
      <h2 className="delivery_orders_list_title">{getTitle()}</h2>

      {orders.length === 0 ? (
        <div className="delivery_no_orders">
          <h2>{getEmptyTitle()}</h2>

          <p>{getEmptyMessage()}</p>
        </div>
      ) : (
        orders.map((order) => (
          <DeliveryOrderRow
            key={order.orderId}
            order={order}
            onClick={() => onSelectOrder(order)}
          />
        ))
      )}
    </section>
  );
}

export default DeliveryOrdersList;
