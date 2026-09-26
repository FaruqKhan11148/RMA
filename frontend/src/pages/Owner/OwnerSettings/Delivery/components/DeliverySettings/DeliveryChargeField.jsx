function DeliveryChargeField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="deliveryCharge">Delivery Charge</label>

      <div className="delivery_input_wrapper">
        <span>₹</span>

        <input
          id="deliveryCharge"
          type="number"
          name="deliveryCharge"
          value={settings.deliveryCharge}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="20"
          disabled={saving}
        />
      </div>

      <small>
        Default delivery charge applied to eligible delivery orders.
      </small>
    </div>
  );
}

export default DeliveryChargeField;
