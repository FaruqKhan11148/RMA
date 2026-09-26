function DeliveryHeader({ onBack }) {
  return (
    <div className="admin-delivery-header">
      <div>
        <button className="back-button" onClick={onBack}>
          ← Dashboard
        </button>

        <h1>Delivery Management</h1>

        <p>
          Monitor delivery persons, active deliveries and completed deliveries.
        </p>
      </div>
    </div>
  );
}

export default DeliveryHeader;
