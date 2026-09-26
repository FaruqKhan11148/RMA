function DeliveryLocation({ deliveryLocation, onChooseLocation }) {
  return (
    <section className="checkout_card checkout_location_card">
      <div className="checkout_card_header">
        <div>
          <span className="checkout_step">01</span>

          <div>
            <h2>Delivery Location</h2>

            <p>Select exactly where you want your order delivered.</p>
          </div>
        </div>
      </div>

      <div className="checkout_choose_location">
        <button
          type="button"
          className="checkout_choose_location_button"
          onClick={onChooseLocation}
        >
          <div className="checkout_choose_location_icon">
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

          <div className="checkout_choose_location_content">
            <strong>
              {deliveryLocation?.address
                ? 'Delivery address selected'
                : 'Choose delivery address'}
            </strong>

            <span>
              {deliveryLocation?.address
                ? deliveryLocation.address
                : 'Select a saved address or add a new one'}
            </span>
          </div>

          <span className="checkout_choose_location_arrow">›</span>
        </button>
      </div>

      {deliveryLocation && (
        <div className="location_selected">
          <span className="location_selected_icon">✓</span>

          <div>
            <strong>Delivery location selected</strong>

            <span>
              {deliveryLocation.address ||
                'Your current location is selected for delivery.'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeliveryLocation;
