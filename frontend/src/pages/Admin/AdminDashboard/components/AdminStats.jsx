function AdminStats({ stats, dashboardLoading }) {
  return (
    <section className="admin-stats-grid">
      <div className="admin-stat-card">
        <span>Total Shops</span>
        <strong>{dashboardLoading ? '...' : stats.totalOwners}</strong>
        <small>Registered owners</small>
      </div>

      <div className="admin-stat-card">
        <span>Total Customers</span>
        <strong>{dashboardLoading ? '...' : stats.totalCustomers}</strong>
        <small>Registered customers</small>
      </div>

      <div className="admin-stat-card">
        <span>Total Orders</span>
        <strong>{dashboardLoading ? '...' : stats.totalOrders}</strong>
        <small>All-time orders</small>
      </div>

      <div className="admin-stat-card">
        <span>RMA Fees</span>
        <strong>{dashboardLoading ? '...' : `₹${stats.totalRmaFees}`}</strong>
        <small>Platform revenue</small>
      </div>
    </section>
  );
}

export default AdminStats;
