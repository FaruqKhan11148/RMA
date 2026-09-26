function ClosingTimeField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="closingTime">Closing Time</label>

      <input
        type="time"
        id="closingTime"
        name="closingTime"
        value={settings.closingTime}
        onChange={handleChange}
        disabled={saving}
      />

      <small>Time when your shop automatically closes for customers.</small>
    </div>
  );
}

export default ClosingTimeField;
