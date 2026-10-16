function DeliveryDashboardTabs({
  dashboardStats,
  activeSection,
  onSectionChange,
}) {
  const today = dashboardStats?.today || {};
  const allTime = dashboardStats?.allTime || {};

  const activeOrderCount = Array.isArray(dashboardStats?.activeOrders)
    ? dashboardStats.activeOrders.length
    : today.pending || 0;

  const tabs = [
    {
      id: 'today',
      label: "Today's Orders",
      count: today.orders || 0,
    },
    {
      id: 'pending',
      label: 'Active Deliveries',
      count: activeOrderCount,
    },
    {
      id: 'completedToday',
      label: 'Completed Today',
      count: today.completed || 0,
    },
    {
      id: 'allDelivered',
      label: 'Total Delivered',
      count: allTime.delivered || 0,
    },
  ];

  return (
    <div className="delivery_dashboard_tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`delivery_dashboard_tab ${
            activeSection === tab.id ? 'active' : ''
          }`}
          onClick={() => onSectionChange(tab.id)}
          aria-pressed={activeSection === tab.id}
        >
          <span>{tab.label}</span>
          <strong>{tab.count}</strong>
        </button>
      ))}
    </div>
  );
}

export default DeliveryDashboardTabs;
