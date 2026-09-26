function MinimumOrderAmountField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="minimumOrderAmount">Minimum Order Amount</label>

      <div className="delivery_input_wrapper">
        <span>₹</span>

        <input
          id="minimumOrderAmount"
          type="number"
          name="minimumOrderAmount"
          value={settings.minimumOrderAmount}
          onChange={handleChange}
          min="0"
          step="1"
          placeholder="200"
          disabled={saving}
        />
      </div>

      <small>
        Minimum product amount required before a customer can place a delivery
        order.
      </small>
    </div>
  );
}

export default MinimumOrderAmountField;
