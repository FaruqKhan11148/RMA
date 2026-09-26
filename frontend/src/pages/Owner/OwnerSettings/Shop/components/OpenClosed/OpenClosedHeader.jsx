function OpenClosedHeader({ navigate }) {
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

        <h1>Open / Closed</h1>

        <p>Control whether customers can currently order from your shop.</p>
      </div>
    </>
  );
}

export default OpenClosedHeader;
