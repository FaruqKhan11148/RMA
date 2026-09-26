function ShopNameHeader({ navigate }) {
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
        <h1>Shop Name</h1>

        <p>Update the name customers see when they visit your RMA shop.</p>
      </div>
    </>
  );
}

export default ShopNameHeader;
