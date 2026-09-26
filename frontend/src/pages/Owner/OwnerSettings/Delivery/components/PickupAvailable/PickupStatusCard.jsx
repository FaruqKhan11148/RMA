function PickupStatusCard({ pickup }) {
  return (
    <div className="pickup_status_card">
      <div
        className={
          pickup
            ? 'pickup_status_icon available'
            : 'pickup_status_icon unavailable'
        }
      >
        {pickup ? '✓' : '×'}
      </div>

      <div className="pickup_status_content">
        <span className="pickup_status_label">Current Pickup Status</span>

        <strong
          className={
            pickup
              ? 'pickup_status_value available'
              : 'pickup_status_value unavailable'
          }
        >
          {pickup ? 'AVAILABLE' : 'UNAVAILABLE'}
        </strong>

        <p>
          {pickup
            ? 'Customers can choose to pick up their orders from your shop.'
            : 'Customers cannot currently choose shop pickup.'}
        </p>
      </div>
    </div>
  );
}

export default PickupStatusCard;
