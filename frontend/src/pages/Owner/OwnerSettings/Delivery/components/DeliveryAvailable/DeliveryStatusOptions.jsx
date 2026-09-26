function DeliveryStatusOptions({ delivery, handleDeliveryChange, saving }) {
  return (
    <div className="delivery_status_options">
      <button
        type="button"
        className={
          delivery
            ? 'delivery_status_option active available_option'
            : 'delivery_status_option available_option'
        }
        onClick={() => handleDeliveryChange(true)}
        disabled={saving}
      >
        <span className="delivery_status_option_icon">✓</span>

        <span>
          <strong>Enable Delivery</strong>
          <small>Allow customers to order delivery</small>
        </span>
      </button>

      <button
        type="button"
        className={
          !delivery
            ? 'delivery_status_option active unavailable_option'
            : 'delivery_status_option unavailable_option'
        }
        onClick={() => handleDeliveryChange(false)}
        disabled={saving}
      >
        <span className="delivery_status_option_icon">×</span>

        <span>
          <strong>Disable Delivery</strong>
          <small>Stop accepting delivery orders</small>
        </span>
      </button>
    </div>
  );
}

export default DeliveryStatusOptions;
