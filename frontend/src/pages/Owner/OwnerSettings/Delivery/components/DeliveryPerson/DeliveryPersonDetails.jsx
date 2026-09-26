function DeliveryPersonDetails({
  deliveryPerson,
  onEdit,
  onStatusChange,
  updatingStatus,
}) {
  return (
    <>
      <h2>Delivery Person Details</h2>

      <p>
        <strong>Name:</strong> {deliveryPerson.name}
      </p>

      <p>
        <strong>Phone:</strong> {deliveryPerson.phone}
      </p>

      <p>
        <strong>Shop ID:</strong> {deliveryPerson.shopId}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {deliveryPerson.isActive ? 'Active' : 'Inactive'}
      </p>

      <button type="button" onClick={onEdit}>
        Edit Details
      </button>

      <button type="button" onClick={onStatusChange} disabled={updatingStatus}>
        {updatingStatus
          ? 'Updating...'
          : deliveryPerson.isActive
            ? 'Deactivate Delivery Person'
            : 'Activate Delivery Person'}
      </button>
    </>
  );
}

export default DeliveryPersonDetails;
