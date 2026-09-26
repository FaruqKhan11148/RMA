function DeliveryRadiusField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="deliveryRadius">Delivery Radius</label>

      <div className="delivery_input_wrapper">
        <input
          id="deliveryRadius"
          type="number"
          name="deliveryRadius"
          value={settings.deliveryRadius}
          onChange={handleChange}
          min="0.1"
          step="0.1"
          placeholder="5"
          disabled={saving}
        />

        <span>km</span>
      </div>

      <small>
        Maximum distance from your shop where delivery orders can be accepted.
      </small>
    </div>
  );
}

export default DeliveryRadiusField;
