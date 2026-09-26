function DeliveryLoginTypeSheet({ isOpen, onClose, onRmaLogin, onShopLogin }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="profile_login_overlay" onClick={onClose}>
      <section
        className="profile_login_sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="profile_login_sheet_handle" />

        <div className="profile_login_sheet_header">
          <h2>Delivery Partner Login</h2>

          <p>Choose your delivery partner type</p>
        </div>

        <div className="profile_login_options">
          <button
            type="button"
            className="profile_login_option"
            onClick={onRmaLogin}
          >
            <div>
              <strong>RMA Delivery Partner</strong>

              <span>Login to your RMA delivery partner account</span>
            </div>

            <span>›</span>
          </button>

          <button
            type="button"
            className="profile_login_option"
            onClick={onShopLogin}
          >
            <div>
              <strong>Particular Shop Delivery Partner</strong>

              <span>Login to a specific shop's delivery account</span>
            </div>

            <span>›</span>
          </button>
        </div>

        <button
          type="button"
          className="profile_login_cancel"
          onClick={onClose}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

export default DeliveryLoginTypeSheet;
