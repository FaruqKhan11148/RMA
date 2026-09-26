function OpenClosedMessages({ saving, error, successMessage }) {
  return (
    <>
      {saving && (
        <div className="shop_status_saving">Updating shop status...</div>
      )}

      {error && <div className="owner_setting_error">{error}</div>}

      {successMessage && (
        <div className="owner_setting_success">{successMessage}</div>
      )}
    </>
  );
}

export default OpenClosedMessages;
