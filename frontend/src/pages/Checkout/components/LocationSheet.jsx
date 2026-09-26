import MapPicker from '../../../components/map/MapPicker';

function LocationSheet({
  showMapPicker,
  loadingAddresses,
  savedAddresses,
  onClose,
  onBack,
  onShowMap,
  onAddAddress,
  onSavedAddressSelect,
  onLocationSelect,
}) {
  return (
    <div className="location_sheet_overlay" onClick={onClose}>
      <div
        className={`location_sheet ${
          showMapPicker ? 'location_sheet_map_mode' : ''
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="location_sheet_handle" />

        {!showMapPicker ? (
          <>
            <div className="location_sheet_header">
              <h3>Choose delivery address</h3>

              <button
                type="button"
                className="location_sheet_close"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <button
              type="button"
              className="location_sheet_current"
              onClick={onShowMap}
            >
              <div className="location_sheet_option_icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 18V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M2 12H6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M18 12H22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              <div>
                <strong>Use current location</strong>
                <span>Use your device's current location</span>
              </div>

              <span className="location_sheet_arrow">›</span>
            </button>

            <button
              type="button"
              className="location_sheet_add"
              onClick={onAddAddress}
            >
              <div className="location_sheet_option_icon">
                <span>+</span>
              </div>

              <div>
                <strong>Add Address</strong>
                <span>Add a new delivery address</span>
              </div>

              <span className="location_sheet_arrow">›</span>
            </button>

            <div className="location_sheet_saved">
              <h4>Saved addresses</h4>

              {loadingAddresses ? (
                <p className="location_sheet_empty">Loading addresses...</p>
              ) : savedAddresses.length === 0 ? (
                <p className="location_sheet_empty">No saved addresses yet.</p>
              ) : (
                savedAddresses.map((savedAddress) => (
                  <button
                    type="button"
                    key={savedAddress._id}
                    className="location_sheet_saved_item"
                    onClick={() => onSavedAddressSelect(savedAddress)}
                  >
                    <div className="location_sheet_saved_icon">
                      <span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 10.5L12 3L21 10.5V21H3V10.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M9 21V14H15V21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>

                    <div className="location_sheet_saved_content">
                      <strong>{savedAddress.label}</strong>

                      <span>{savedAddress.address}</span>
                    </div>

                    <span className="location_sheet_arrow">›</span>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <div className="location_sheet_header">
              <button
                type="button"
                className="location_sheet_back"
                onClick={onBack}
              >
                ‹
              </button>

              <h3>Choose delivery location</h3>

              <button
                type="button"
                className="location_sheet_close"
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <MapPicker onLocationSelect={onLocationSelect} />
          </>
        )}
      </div>
    </div>
  );
}

export default LocationSheet;
