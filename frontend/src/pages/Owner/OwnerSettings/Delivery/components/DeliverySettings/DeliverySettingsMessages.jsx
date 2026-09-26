function DeliverySettingsMessages({ error, successMessage }) {
  return (
    <>
      {error && <div className="owner_setting_error">{error}</div>}

      {successMessage && (
        <div className="owner_setting_success">{successMessage}</div>
      )}
    </>
  );
}

export default DeliverySettingsMessages;
