import {
  LayoutDashboard,
  Gift,
  Languages,
  Palette,
  Info,
  CircleHelp,
  MessageCircle,
  UserRound,
  Truck,
  LogOut,
} from 'lucide-react';

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
          <span className="profile_item_left">
            <LayoutDashboard size={19} strokeWidth={2} />
            <span>Owner Dashboard</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/offers')}
        >
          <span className="profile_item_left">
            <Gift size={19} strokeWidth={2} />
            <span>Offers & Rewards</span>
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

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span className="profile_item_left">
            <Truck size={19} strokeWidth={2} />
            <span>Delivery Partner Login</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <button
        className="profile_item logout_button"
        onClick={handleOwnerLogout}
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
