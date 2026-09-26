function DeliveryStats({
  totalDeliveryPersons,
  activeDeliveryPersons,
  inactiveDeliveryPersons,
  activeDeliveries,
  completedDeliveries,
  totalDeliveryOrders,
}) {
  return (
    <div className="delivery-stats-grid">
      <div className="delivery-stat-card">
        <span>Total Delivery Persons</span>
        <strong>{totalDeliveryPersons}</strong>
      </div>

      <div className="delivery-stat-card">
        <span>Active Persons</span>
        <strong>{activeDeliveryPersons}</strong>
      </div>

      <div className="delivery-stat-card">
        <span>Inactive Persons</span>
        <strong>{inactiveDeliveryPersons}</strong>
      </div>

      <div className="delivery-stat-card">
        <span>Active Deliveries</span>
        <strong>{activeDeliveries}</strong>
      </div>

      <div className="delivery-stat-card">
        <span>Completed Deliveries</span>
        <strong>{completedDeliveries}</strong>
      </div>

      <div className="delivery-stat-card">
        <span>Total Delivery Orders</span>
        <strong>{totalDeliveryOrders}</strong>
      </div>
    </div>
  );
}

export default DeliveryStats;
