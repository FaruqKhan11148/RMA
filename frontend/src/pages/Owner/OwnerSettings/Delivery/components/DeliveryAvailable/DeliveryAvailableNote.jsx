function DeliveryAvailableNote() {
  return (
    <div className="delivery_status_note">
      <strong>Important</strong>

      <span>
        Disabling delivery should only remove the delivery option for new
        orders. Existing orders should continue normally.
      </span>
    </div>
  );
}

export default DeliveryAvailableNote;
