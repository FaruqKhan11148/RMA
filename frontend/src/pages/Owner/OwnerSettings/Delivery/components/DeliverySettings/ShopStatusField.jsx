function ShopStatusField({ settings, handleChange, saving }) {
  return (
    <div className="delivery_setting_group">
      <label htmlFor="shopStatusMode">Shop Status</label>

      <select
        id="shopStatusMode"
        name="shopStatusMode"
        value={settings.shopStatusMode}
        onChange={handleChange}
        disabled={saving}
      >
        <option value="auto">Automatic</option>
        <option value="open">Always Open</option>
        <option value="closed">Always Closed</option>
      </select>

      <small>
        Automatic follows your opening and closing time. Always Open or Always
        Closed keeps your shop in that status regardless of the schedule.
      </small>
    </div>
  );
}

export default ShopStatusField;
