import RoleSwitchSheet from './RoleSwitchSheet';

import {
  LayoutDashboard,
  Truck,
  WalletCards,
  Languages,
  Palette,
  Info,
  MessageCircle,
  CircleHelp,
  UserRound,
  Store,
  LogOut,
} from 'lucide-react';

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
          <span className="profile_item_left">
            <LayoutDashboard size={19} strokeWidth={2} />
            <span>Delivery Dashboard</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/delivery/orders-delivery')}
        >
          <span className="profile_item_left">
            <Truck size={19} strokeWidth={2} />
            <span>Delivery Orders</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/delivery/earnings')}
        >
          <span className="profile_item_left">
            <WalletCards size={19} strokeWidth={2} />
            <span>Earnings</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Preferences</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/language')}
        >
          <span className="profile_item_left">
            <Languages size={19} strokeWidth={2} />
            <span>Language</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/appearance')}
        >
          <span className="profile_item_left">
            <Palette size={19} strokeWidth={2} />
            <span>Appearance</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>About RMA</h2>

        <button className="profile_item" onClick={() => navigate('/about')}>
          <span className="profile_item_left">
            <Info size={19} strokeWidth={2} />
            <span>About Us</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Support</h2>

        <button className="profile_item" onClick={() => navigate('/rma-chat')}>
          <span className="profile_item_left">
            <MessageCircle size={19} strokeWidth={2} />
            <span>RMA Support</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/help-support')}
        >
          <span className="profile_item_left">
            <CircleHelp size={19} strokeWidth={2} />
            <span>Help & Support</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Switch Account</h2>

        <button
          className="profile_item"
          onClick={() => setSwitchRole('customer')}
        >
          <span className="profile_item_left">
            <UserRound size={19} strokeWidth={2} />
            <span>Customer Login</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button className="profile_item" onClick={() => setSwitchRole('owner')}>
          <span className="profile_item_left">
            <Store size={19} strokeWidth={2} />
            <span>Owner Login</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <button
        className="profile_item logout_button"
        onClick={handleDeliveryLogout}
      >
        <span className="profile_item_left">
          <LogOut size={19} strokeWidth={2} />
          <span>Logout</span>
        </span>

        <span className="profile_item_arrow">›</span>
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
