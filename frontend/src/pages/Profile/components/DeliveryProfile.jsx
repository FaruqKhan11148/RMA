import RoleSwitchSheet from './RoleSwitchSheet';

function DeliveryProfile({
  deliveryPerson,
  navigate,
  setSwitchRole,
  handleDeliveryLogout,
  switchRole,
  switchingRole,
  handleRoleSwitch,
}) {
  const firstLetter = deliveryPerson.name
    ? deliveryPerson.name.charAt(0).toUpperCase()
    : 'D';

  const isShopDeliveryPartner = deliveryPerson.deliveryType === 'SHOP';

  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">{firstLetter}</div>

        <h1>{deliveryPerson.name}</h1>

        <p>Delivery Partner</p>
      </section>

      <section className="profile_customer_card">
        {isShopDeliveryPartner && deliveryPerson.shopId && (
          <div className="profile_customer_row">
            <span>Shop ID</span>

            <strong>{deliveryPerson.shopId}</strong>
          </div>
        )}

        <div className="profile_customer_row">
          <span>Mobile</span>

          <strong>{deliveryPerson.phone}</strong>
        </div>

        <div className="profile_customer_row">
          <span>Partner Type</span>

          <strong>
            {isShopDeliveryPartner
              ? 'Shop Delivery Partner'
              : 'RMA Delivery Partner'}
          </strong>
        </div>
      </section>

      <section className="profile_section">
        <h2>Delivery</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/delivery/dashboard')}
        >
          <span>Delivery Dashboard</span>

          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/delivery/orders-delivery')}
        >
          <span>Delivery Orders</span>

          <span>›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/delivery/earnings')}
        >
          <span>Earnings</span>

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

        <button className="profile_item" onClick={() => setSwitchRole('owner')}>
          <span>Owner Login</span>

          <span>›</span>
        </button>
      </section>

      <button className="logout_button" onClick={handleDeliveryLogout}>
        Logout
      </button>

      <RoleSwitchSheet
        switchRole={switchRole}
        switchingRole={switchingRole}
        currentRole="delivery"
        onCancel={() => setSwitchRole(null)}
        onConfirm={handleRoleSwitch}
      />
    </main>
  );
}

export default DeliveryProfile;
