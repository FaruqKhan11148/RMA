function ShopStats({ stats }) {
  return (
    <section className="admin-shop-stat-grid">
      <div className="admin-shop-stat-card">
        <span>Total Orders</span>
        <strong>{stats.totalOrders}</strong>
        <small>All orders received</small>
      </div>

      <div className="admin-shop-stat-card">
        <span>Completed Orders</span>
        <strong>{stats.completedOrders}</strong>
        <small>Successfully completed</small>
      </div>

      <div className="admin-shop-stat-card">
        <span>Total Transactions</span>
        <strong>₹{stats.totalTransactionValue.toFixed(2)}</strong>
        <small>Total order value</small>
      </div>

      <div className="admin-shop-stat-card">
        <span>Completed Value</span>
        <strong>₹{stats.completedTransactionValue.toFixed(2)}</strong>
        <small>Completed paid orders</small>
      </div>

      <div className="admin-shop-stat-card">
        <span>RMA Fees</span>
        <strong>₹{stats.totalRmaFees.toFixed(2)}</strong>
        <small>1% platform fee</small>
      </div>
    </section>
  );
}

export default ShopStats;
