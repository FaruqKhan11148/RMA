function DeliverySettingsHeader({ navigate }) {
  return (
    <>
      <button
        type="button"
        className="owner_setting_back"
        onClick={() => navigate(-1)}
      >
        ← Delivery Settings
      </button>

      <div className="owner_setting_header">
        <p className="owner_setting_tag">DELIVERY SETTINGS</p>

        <h1>Delivery Settings</h1>

        <p>
          Configure the delivery rules and estimated delivery information for
          your shop.
        </p>
      </div>
    </>
  );
}

export default DeliverySettingsHeader;
