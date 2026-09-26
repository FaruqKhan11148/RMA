function AddressHeader({ navigate }) {
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
        <h1>Shop Address</h1>

        <p>
          Update the physical address of your shop that customers can use to
          identify your location.
        </p>
      </div>
    </>
  );
}

export default AddressHeader;
