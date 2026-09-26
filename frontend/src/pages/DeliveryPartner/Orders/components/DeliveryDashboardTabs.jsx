function DeliveryDashboardTabs({
  dashboardStats,
  activeSection,
  onSectionChange,
}) {
  return (
    <div className="delivery_dashboard_tabs">
      <button
        type="button"
        className={`delivery_dashboard_tab ${
          activeSection === 'today' ? 'active' : ''
        }`}
        onClick={() => onSectionChange('today')}
      >
        <span>Today's Orders</span>
        <strong>{dashboardStats.today.orders}</strong>
      </button>

      <button
        type="button"
        className={`delivery_dashboard_tab ${
          activeSection === 'pending' ? 'active' : ''
        }`}
        onClick={() => onSectionChange('pending')}
      >
        <span>Pending</span>
        <strong>{dashboardStats.today.pending}</strong>
      </button>

      <button
        type="button"
        className={`delivery_dashboard_tab ${
          activeSection === 'completedToday' ? 'active' : ''
        }`}
        onClick={() => onSectionChange('completedToday')}
      >
        <span>Completed Today</span>
        <strong>{dashboardStats.today.completed}</strong>
      </button>

      <button
        type="button"
        className={`delivery_dashboard_tab ${
          activeSection === 'allDelivered' ? 'active' : ''
        }`}
        onClick={() => onSectionChange('allDelivered')}
      >
        <span>Total Delivered</span>
        <strong>{dashboardStats.allTime.delivered}</strong>
      </button>
    </div>
  );
}

export default DeliveryDashboardTabs;
