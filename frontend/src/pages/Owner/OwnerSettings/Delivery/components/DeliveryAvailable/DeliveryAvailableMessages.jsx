function DeliveryAvailableMessages({ saving, error, successMessage }) {
  return (
    <>
      {saving && (
        <div className="delivery_status_saving">
          Updating delivery availability...
        </div>
      )}

      {error && <div className="owner_setting_error">{error}</div>}

      {successMessage && (
        <div className="owner_setting_success">{successMessage}</div>
      )}
    </>
  );
}

export default DeliveryAvailableMessages;
