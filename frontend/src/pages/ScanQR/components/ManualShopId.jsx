function ManualShopId({ manualId, onManualIdChange, onSubmit }) {
  return (
    <div className="manual_shop_section">
      <label htmlFor="manual-shop-id">Shop ID</label>

      <div className="manual_shop_row">
        <input
          id="manual-shop-id"
          type="text"
          value={manualId}
          onChange={(e) => onManualIdChange(e.target.value)}
          placeholder="RMA-000005"
          autoComplete="off"
        />

        <button type="button" onClick={onSubmit}>
          Open
        </button>
      </div>
    </div>
  );
}

export default ManualShopId;
