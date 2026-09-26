function DescriptionHeader({ navigate }) {
  return (
    <>
      <button
        type="button"
        className="owner_setting_back"
        onClick={() => navigate('/owner/settings/account')}
      >
        ← Shop Settings
      </button>

      <div className="owner_setting_header">
        <h1>Shop Description</h1>

        <p>
          Tell customers a little about your shop, products, quality, or what
          makes your shop special.
        </p>
      </div>
    </>
  );
}

export default DescriptionHeader;
