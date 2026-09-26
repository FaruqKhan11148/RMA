function PickupStatusMessages({ saving, error, successMessage }) {
  return (
    <>
      {saving && (
        <div className="pickup_status_saving">
          Updating pickup availability...
        </div>
      )}

      {error && <div className="owner_setting_error">{error}</div>}

      {successMessage && (
        <div className="owner_setting_success">{successMessage}</div>
      )}
    </>
  );
}

export default PickupStatusMessages;
