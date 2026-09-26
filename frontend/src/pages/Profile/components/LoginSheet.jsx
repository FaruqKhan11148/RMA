import DeliveryLoginTypeSheet from './DeliveryLoginTypeSheet';

function LoginSheet({
  isOpen,
  onClose,
  navigate,
  setLoginSheetOpen,
  setDeliveryLoginTypeSheetOpen,
  deliveryLoginTypeSheetOpen,
  handleDeliveryRmaLogin,
  handleShopDeliveryLogin,
}) {
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
          <h2>Login to RMA</h2>

          <p>Choose how you want to continue</p>
        </div>

        <div className="profile_login_options">
          <button
            type="button"
            className="profile_login_option"
            onClick={() => navigate('/customer/login')}
          >
            <div>
              <strong>Customer</strong>

              <span>Login to your customer account</span>
            </div>

            <span>›</span>
          </button>

          <button
            type="button"
            className="profile_login_option"
            onClick={() => navigate('/owner/login')}
          >
            <div>
              <strong>Owner</strong>

              <span>Login to your shop account</span>
            </div>

            <span>›</span>
          </button>

          <button
            type="button"
            className="profile_login_option"
            onClick={() => {
              setLoginSheetOpen(false);
              setDeliveryLoginTypeSheetOpen(true);
            }}
          >
            <div>
              <strong>Delivery Partner</strong>

              <span>Login to your delivery account</span>
            </div>

            <span>›</span>
          </button>
        </div>

        <button
          type="button"
          className="profile_login_cancel"
          onClick={() => setLoginSheetOpen(false)}
        >
          Cancel
        </button>
      </section>

      <DeliveryLoginTypeSheet
        isOpen={deliveryLoginTypeSheetOpen}
        onClose={() => setDeliveryLoginTypeSheetOpen(false)}
        onRmaLogin={handleDeliveryRmaLogin}
        onShopLogin={handleShopDeliveryLogin}
      />
    </div>
  );
}

export default LoginSheet;
