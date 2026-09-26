function OwnerStats({
  todayOrders,
  pendingOrders,
  completedOrders,
  totalRevenue,
}) {
  return (
    <section className="owner_stats">
      <div className="owner_stat_card">
        <span>Today's Orders</span>
        <strong>{todayOrders.length}</strong>
      </div>

      <div className="owner_stat_card">
        <span>Pending</span>
        <strong>{pendingOrders.length}</strong>
      </div>

      <div className="owner_stat_card">
        <span>Completed</span>
        <strong>{completedOrders.length}</strong>
      </div>

      <div className="owner_stat_card">
        <span>Today's Revenue</span>
        <strong>₹{totalRevenue}</strong>
      </div>
    </section>
  );
}

export default OwnerStats;
