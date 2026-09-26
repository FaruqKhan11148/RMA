function EstimatedDeliveryTimeField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="estimatedDeliveryTime">Estimated Delivery Time</label>

      <div className="delivery_input_wrapper">
        <input
          id="estimatedDeliveryTime"
          type="number"
          name="estimatedDeliveryTime"
          value={settings.estimatedDeliveryTime}
          onChange={handleChange}
          min="1"
          step="1"
          placeholder="45"
          disabled={saving}
        />

        <span>min</span>
      </div>

      <small>Approximate time required to prepare and deliver an order.</small>
    </div>
  );
}

export default EstimatedDeliveryTimeField;
