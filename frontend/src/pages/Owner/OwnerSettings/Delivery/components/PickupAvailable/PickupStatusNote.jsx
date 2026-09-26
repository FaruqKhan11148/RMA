function PickupStatusNote() {
  return (
    <div className="pickup_status_note">
      <strong>Important</strong>

      <span>
        Disabling pickup should only remove the pickup option for new orders.
        Existing orders should continue normally.
      </span>
    </div>
  );
}

export default PickupStatusNote;
