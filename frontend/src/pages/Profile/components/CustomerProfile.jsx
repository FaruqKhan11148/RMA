import RoleSwitchSheet from './RoleSwitchSheet';
import DeliveryLoginTypeSheet from './DeliveryLoginTypeSheet';

function CustomerProfile({
  customer,
  t,
  navigate,
  setSwitchRole,
  setDeliveryLoginTypeSheetOpen,
  handleLogout,
  switchRole,
  switchingRole,
  handleRoleSwitch,
  deliveryLoginTypeSheetOpen,
  handleDeliveryRmaLogin,
  handleShopDeliveryLogin,
}) {
  const firstLetter = customer.name
    ? customer.name.charAt(0).toUpperCase()
    : 'R';

  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">{firstLetter}</div>
        <h1>{customer.name}</h1>
        <p>{customer.email}</p>
      </section>

      <section className="profile_customer_card">
        <div className="profile_customer_row">
          <span>Mobile</span>
          <strong>{customer.phone}</strong>
        </div>
        <div className="profile_customer_row">
          <span>Email</span>
          <strong>{customer.email}</strong>
        </div>
      </section>

      <section className="profile_section">
        <h2>My Activity</h2>
        <button className="profile_item" onClick={() => navigate('/orders')}>
          <span>{t.bottomNav.orders}</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>My Account</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/personal-details')}
        >
          <span>Personal Details</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/saved-addresses')}
        >
          <span>Saved Addresses</span>
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
        <h2>Owner</h2>

        <button className="profile_item" onClick={() => setSwitchRole('owner')}>
          <span>Owner Login</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/register/step-1')}
        >
          <span>Register Your Shop</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/dashboard')}
        >
          <span>Owner Dashboard</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Delivery Partner</h2>

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span>Delivery Partner Login</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span>Become a Delivery Partner</span>
          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span>Delivery Partner Dashboard</span>
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

      <button className="logout_button" onClick={handleLogout}>
        Logout
      </button>

      <RoleSwitchSheet
        switchRole={switchRole}
        switchingRole={switchingRole}
        currentRole="customer"
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

export default CustomerProfile;
