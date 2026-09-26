function DeliveryStatusCard({ delivery }) {
  return (
    <div className="delivery_status_card">
      <div
        className={
          delivery
            ? 'delivery_status_icon available'
            : 'delivery_status_icon unavailable'
        }
      >
        {delivery ? '✓' : '×'}
      </div>

      <div className="delivery_status_content">
        <span className="delivery_status_label">Current Delivery Status</span>

        <strong
          className={
            delivery
              ? 'delivery_status_value available'
              : 'delivery_status_value unavailable'
          }
        >
          {delivery ? 'AVAILABLE' : 'UNAVAILABLE'}
        </strong>

        <p>
          {delivery
            ? 'Customers can choose delivery for their orders.'
            : 'Customers will not be able to choose delivery for new orders.'}
        </p>
      </div>
    </div>
  );
}

export default DeliveryStatusCard;
