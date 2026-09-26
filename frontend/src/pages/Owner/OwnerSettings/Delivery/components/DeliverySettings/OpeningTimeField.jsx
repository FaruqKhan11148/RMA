function OpeningTimeField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="openingTime">Opening Time</label>

      <input
        type="time"
        id="openingTime"
        name="openingTime"
        value={settings.openingTime}
        onChange={handleChange}
        disabled={saving}
      />

      <small>Time when your shop automatically opens for customers.</small>
    </div>
  );
}

export default OpeningTimeField;
