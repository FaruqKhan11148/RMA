import RoleSwitchSheet from './RoleSwitchSheet';
import DeliveryLoginTypeSheet from './DeliveryLoginTypeSheet';

function OwnerProfile({
  owner,
  navigate,
  setSwitchRole,
  setDeliveryLoginTypeSheetOpen,
  handleOwnerLogout,
  switchRole,
  switchingRole,
  handleRoleSwitch,
  deliveryLoginTypeSheetOpen,
  handleDeliveryRmaLogin,
  handleShopDeliveryLogin,
}) {
  const firstLetter = owner.ownerName
    ? owner.ownerName.charAt(0).toUpperCase()
    : 'R';

  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">{firstLetter}</div>

        <h1>{owner.ownerName}</h1>

        <p>{owner.shopName}</p>
      </section>

      <section className="profile_customer_card">
        <div className="profile_customer_row">
          <span>Shop ID</span>
          <strong>{owner.shopId}</strong>
        </div>

        <div className="profile_customer_row">
          <span>Mobile</span>
          <strong>{owner.phone}</strong>
        </div>

        <div className="profile_customer_row">
          <span>Email</span>
          <strong>{owner.email}</strong>
        </div>
      </section>

      <section className="profile_section">
        <h2>My Shop</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/dashboard')}
        >
          <span>Owner Dashboard</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/offers')}
        >
          <span>Offers & Rewards</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Preferences</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/language')}
        >
          <span>Language</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Support</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/help-support')}
        >
          <span>Help & Support</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Switch Account</h2>

        <button
          className="profile_item"
          onClick={() => setSwitchRole('customer')}
        >
          <span>Customer Login</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span>Delivery Partner Login</span>
          <span>›</span>
        </button>
      </section>

      <button className="logout_button" onClick={handleOwnerLogout}>
        Logout
      </button>

      <RoleSwitchSheet
        switchRole={switchRole}
        switchingRole={switchingRole}
        currentRole="owner"
        onCancel={() => setSwitchRole(null)}
        onConfirm={handleRoleSwitch}
      />

      <DeliveryLoginTypeSheet
        isOpen={deliveryLoginTypeSheetOpen}
        onClose={() => setDeliveryLoginTypeSheetOpen(false)}
        onRmaLogin={handleDeliveryRmaLogin}
        onShopLogin={handleShopDeliveryLogin}
      />
    </main>
  );
}

export default OwnerProfile;
