function FindShopLocation({ locationName, onChangeLocation }) {
  return (
    <section className="find_shop_location">
      <div className="find_shop_location_icon">
        <svg
          width="22"
          height="22"
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
      </div>

      <div className="find_shop_location_content">
        <span>DELIVERING TO</span>

        <strong>{locationName || 'Your current location'}</strong>
      </div>

      <button
        type="button"
        className="find_shop_change_location"
        onClick={onChangeLocation}
      >
        Change
      </button>
    </section>
  );
}

export default FindShopLocation;
