function DeliveryPartnersEmpty() {
  return (
    <div className="admin_empty_state">
      <div className="admin_empty_icon">✓</div>

      <h2>No Pending Applications</h2>

      <p>
        There are currently no delivery partner applications waiting for
        approval.
      </p>
    </div>
  );
}

export default DeliveryPartnersEmpty;
