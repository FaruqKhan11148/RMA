function OwnerSettingsHeader({ navigate }) {
  return (
    <div className="owner-settings-header">
      <button
        className="back-button"
        onClick={() => navigate('/owner/dashboard')}
      >
        ← Dashboard
      </button>

      <div>
        <h1>Settings</h1>
        <p>Manage your account, shop, products, delivery and payments.</p>
      </div>
    </div>
  );
}

export default OwnerSettingsHeader;
