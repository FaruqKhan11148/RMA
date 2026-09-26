function GuestDeliveryLoginSheet({
  isOpen,
  customer,
  setCustomer,
  setDeliveryLoginTypeSheetOpen,
  navigate,
}) {
  if (!isOpen) {
    return null;
  }

  const handleRmaDeliveryLogin = async () => {
    if (customer) {
      try {
        await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/logout',
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      } catch (error) {
        console.error('Customer logout failed:', error);
      }

      setCustomer(null);
    }

    setDeliveryLoginTypeSheetOpen(false);
    navigate('/delivery/rma-login');
  };

  const handleShopDeliveryLogin = async () => {
    if (customer) {
      try {
        await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/logout',
          {
            method: 'POST',
            credentials: 'include',
          },
        );
      } catch (error) {
        console.error('Customer logout failed:', error);
      }

      setCustomer(null);
    }

    setDeliveryLoginTypeSheetOpen(false);
    navigate('/delivery/orders-delivery');
  };

  return (
    <div
      className="profile_login_overlay"
      onClick={() => setDeliveryLoginTypeSheetOpen(false)}
    >
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
            onClick={handleRmaDeliveryLogin}
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
            onClick={handleShopDeliveryLogin}
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
          onClick={() => setDeliveryLoginTypeSheetOpen(false)}
        >
          Cancel
        </button>
      </section>
    </div>
  );
}

export default GuestDeliveryLoginSheet;
