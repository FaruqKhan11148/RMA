function DeliveryDashboardHeader({ partnerName, isOnline }) {
  return (
    <section className="delivery_dashboard_header">
      <div>
        <span className="delivery_dashboard_greeting">Welcome back</span>

        <h1>{partnerName}</h1>

        <p>Ready to deliver today?</p>
      </div>

      <div
        className={`delivery_online_badge ${isOnline ? 'online' : 'offline'}`}
      >
        <span />

        {isOnline ? 'Online' : 'Offline'}
      </div>
    </section>
  );
}

export default DeliveryDashboardHeader;
