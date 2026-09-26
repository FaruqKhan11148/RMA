function LocationActions({ error, successMessage, saving, shopLocation }) {
  return (
    <>
      {error && <div className="owner_setting_error">{error}</div>}

      {successMessage && (
        <div className="owner_setting_success">{successMessage}</div>
      )}

      <button
        type="submit"
        className="owner_setting_save"
        disabled={saving || !shopLocation}
      >
        {saving ? 'Saving...' : 'Save Location'}
      </button>
    </>
  );
}

export default LocationActions;
