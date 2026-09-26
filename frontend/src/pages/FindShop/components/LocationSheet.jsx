function LocationSheet({
  savedAddresses,
  loadingAddresses,
  onClose,
  onUseCurrentLocation,
  onAddAddress,
  onSelectAddress,
}) {
  return (
    <div className="location_sheet_overlay" onClick={onClose}>
      <div
        className="location_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="location_sheet_handle" />

        <div className="location_sheet_header">
          <h2>Select a location</h2>

          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="location_sheet_options">
          <button
            type="button"
            className="location_sheet_option"
            onClick={onUseCurrentLocation}
          >
            <div className="location_sheet_option_icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M12 2V5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M12 19V22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M2 12H5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M19 12H22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="location_sheet_option_content">
              <strong>Use current location</strong>

              <span>Use your device's current location</span>
            </div>

            <span className="location_sheet_arrow">›</span>
          </button>

          <button
            type="button"
            className="location_sheet_option"
            onClick={onAddAddress}
          >
            <div className="location_sheet_option_icon">
              <span>+</span>
            </div>

            <div className="location_sheet_option_content">
              <strong>Add Address</strong>

              <span>Add a new delivery address</span>
            </div>

            <span className="location_sheet_arrow">›</span>
          </button>
        </div>

        <div className="location_sheet_saved">
          <span className="location_sheet_saved_title">SAVED ADDRESSES</span>

          {loadingAddresses && (
            <div className="location_sheet_empty">
              Loading saved addresses...
            </div>
          )}

          {!loadingAddresses && savedAddresses.length === 0 && (
            <div className="location_sheet_empty">No saved addresses yet.</div>
          )}

          {!loadingAddresses && savedAddresses.length > 0 && (
            <div className="location_sheet_saved_list">
              {savedAddresses.map((savedAddress) => (
                <button
                  key={savedAddress._id}
                  type="button"
                  className="location_sheet_saved_address"
                  onClick={() => onSelectAddress(savedAddress)}
                >
                  <div className="location_sheet_saved_address_icon">
                    {savedAddress.label === 'Home' && (
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
                    )}

                    {savedAddress.label === 'Work' && (
                      <span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 21V6H20V21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M8 6V3H16V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M4 10H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          <path
                            d="M9 14H11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          <path
                            d="M13 14H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          <path
                            d="M9 18H11"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          <path
                            d="M13 18H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    )}

                    {savedAddress.label === 'Other' && (
                      <span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5 5 9C5 14.5 12 21 12 21Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="12"
                            cy="9"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </span>
                    )}
                  </div>

                  <div className="location_sheet_saved_address_content">
                    <div className="location_sheet_saved_address_title">
                      <strong>{savedAddress.label}</strong>

                      {savedAddress.isDefault && (
                        <span className="location_sheet_default">DEFAULT</span>
                      )}
                    </div>

                    <p>{savedAddress.address}</p>
                  </div>

                  <span className="location_sheet_arrow">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationSheet;
