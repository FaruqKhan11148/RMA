import { useLanguage } from '../../../context/LanguageContext';
import { AddressSkeletons } from './HomeSkeleton';

function HomeLocationSheet({
  showLocationSheet,
  setShowLocationSheet,
  handleLocationClick,
  customerLoggedIn,
  navigate,
  loadingAddresses,
  savedAddresses,
  handleSavedAddressSelect,
}) {
  const { t } = useLanguage();

  if (!showLocationSheet) {
    return null;
  }

  return (
    <div
      className="location_sheet_overlay"
      onClick={() => setShowLocationSheet(false)}
    >
      <div
        className="location_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="location_sheet_handle" />

        <div className="location_sheet_header">
          <h2>{t.home.locationSheetTitle}</h2>

          <button
            type="button"
            onClick={() => setShowLocationSheet(false)}
            aria-label={t.home.close}
          >
            ×
          </button>
        </div>

        <div className="location_sheet_options">
          <button
            type="button"
            className="location_sheet_option"
            onClick={() => {
              setShowLocationSheet(false);
              handleLocationClick();
            }}
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
              <strong>{t.home.useCurrentLocation}</strong>
              <span>{t.home.useCurrentLocationDescription}</span>
            </div>

            <span className="location_sheet_arrow">›</span>
          </button>

          <button
            type="button"
            className="location_sheet_option"
            onClick={() => {
              setShowLocationSheet(false);

              if (customerLoggedIn) {
                navigate('/profile/saved-addresses/add', {
                  state: {
                    returnToLocationSheet: true,
                    returnPath: '/',
                  },
                });
                return;
              }

              navigate('/customer/login?redirect=/profile/saved-addresses/add');
            }}
          >
            <div className="location_sheet_option_icon">
              <span>+</span>
            </div>

            <div className="location_sheet_option_content">
              <strong>{t.home.addAddress}</strong>
              <span>{t.home.addAddressDescription}</span>
            </div>

            <span className="location_sheet_arrow">›</span>
          </button>
        </div>

        <div className="location_sheet_saved">
          <span className="location_sheet_saved_title">
            {t.home.savedAddressesTitle}
          </span>

          {loadingAddresses && <AddressSkeletons />}

          {!loadingAddresses && savedAddresses.length === 0 && (
            <div className="location_sheet_empty">
              {t.home.noSavedAddresses}
            </div>
          )}

          {!loadingAddresses && savedAddresses.length > 0 && (
            <div className="location_sheet_saved_list">
              {savedAddresses.map((savedAddress) => (
                <button
                  key={savedAddress._id}
                  type="button"
                  className="location_sheet_saved_address"
                  onClick={() => handleSavedAddressSelect(savedAddress)}
                >
                  <div className="location_sheet_saved_address_icon">
                    {savedAddress.label === 'Home' && <span>⌂</span>}

                    {savedAddress.label === 'Work' && <span>▣</span>}

                    {savedAddress.label === 'Other' && <span>●</span>}
                  </div>

                  <div className="location_sheet_saved_address_content">
                    <div className="location_sheet_saved_address_title">
                      <strong>{savedAddress.label}</strong>

                      {savedAddress.isDefault && (
                        <span className="location_sheet_default">
                          {t.home.defaultAddress}
                        </span>
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

export default HomeLocationSheet;
