function PickupAvailableHeader({ navigate }) {
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

        <h1>Pickup Available</h1>

        <p>
          Control whether customers can collect their orders directly from your
          shop.
        </p>
      </div>
    </>
  );
}

export default PickupAvailableHeader;
