function PickupStatusOptions({ pickup, handlePickupChange, saving }) {
  return (
    <div className="pickup_status_options">
      <button
        type="button"
        className={
          pickup
            ? 'pickup_status_option active available_option'
            : 'pickup_status_option available_option'
        }
        onClick={() => handlePickupChange(true)}
        disabled={saving}
      >
        <span className="pickup_status_option_icon">✓</span>

        <span>
          <strong>Enable Pickup</strong>
          <small>Allow customers to collect orders</small>
        </span>
      </button>

      <button
        type="button"
        className={
          !pickup
            ? 'pickup_status_option active unavailable_option'
            : 'pickup_status_option unavailable_option'
        }
        onClick={() => handlePickupChange(false)}
        disabled={saving}
      >
        <span className="pickup_status_option_icon">×</span>

        <span>
          <strong>Disable Pickup</strong>
          <small>Stop accepting pickup orders</small>
        </span>
      </button>
    </div>
  );
}

export default PickupStatusOptions;
