function FreeDeliveryField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="freeDeliveryAbove">Free Delivery Above</label>

      <div className="delivery_input_wrapper">
        <span>₹</span>

        <input
          id="freeDeliveryAbove"
          type="number"
          name="freeDeliveryAbove"
          value={settings.freeDeliveryAbove}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="500"
          disabled={saving}
        />
      </div>

      <small>
        Orders above this amount can receive free delivery. Enter 0 to disable
        free delivery.
      </small>
    </div>
  );
}

export default FreeDeliveryField;
