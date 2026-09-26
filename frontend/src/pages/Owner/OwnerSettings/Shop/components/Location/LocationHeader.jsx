function LocationHeader({ navigate }) {
  return (
    <>
      <button
        type="button"
        className="owner_setting_back"
        onClick={() => navigate(-1)}
      >
        ← Shop Settings
      </button>

      <div className="owner_setting_header">
        <p className="owner_setting_tag">SHOP SETTINGS</p>

        <h1>Shop Location</h1>

        <p>
          Select the exact location of your shop on the map. This location will
          be used for delivery routing.
        </p>
      </div>
    </>
  );
}

export default LocationHeader;
