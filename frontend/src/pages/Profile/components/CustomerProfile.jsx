import {
  ShoppingBag,
  UserRound,
  MapPin,
  Languages,
  Store,
  PlusCircle,
  LayoutDashboard,
  Truck,
  UserPlus,
  CircleHelp,
  LogOut,
  Palette,
  Info,
} from 'lucide-react';

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
          <span className="profile_item_left">
            <ShoppingBag size={19} strokeWidth={2} />
            <span>{t.bottomNav.orders}</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>My Account</h2>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/personal-details')}
        >
          <span className="profile_item_left">
            <UserRound size={19} strokeWidth={2} />
            <span>Personal Details</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/profile/saved-addresses')}
        >
          <span className="profile_item_left">
            <MapPin size={19} strokeWidth={2} />
            <span>Address Book</span>
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
        <h2>Owner</h2>

        <button className="profile_item" onClick={() => setSwitchRole('owner')}>
          <span className="profile_item_left">
            <Store size={19} strokeWidth={2} />
            <span>Owner Login</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => navigate('/owner/register/step-1')}
        >
          <span className="profile_item_left">
            <PlusCircle size={19} strokeWidth={2} />
            <span>Register Your Shop</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

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
      </section>

      <section className="profile_section">
        <h2>Delivery Partner</h2>

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

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span className="profile_item_left">
            <UserPlus size={19} strokeWidth={2} />
            <span>Become a Delivery Partner</span>
          </span>

          <span className="profile_item_arrow">›</span>
        </button>

        <button
          className="profile_item"
          onClick={() => setDeliveryLoginTypeSheetOpen(true)}
        >
          <span className="profile_item_left">
            <LayoutDashboard size={19} strokeWidth={2} />
            <span>Delivery Partner Dashboard</span>
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
            <CircleHelp size={19} strokeWidth={2} />
            <span>Need Help ?</span>
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

      <button className="profile_item logout_button" onClick={handleLogout}>
        <span className="profile_item_left">
          <LogOut size={19} strokeWidth={2} />
          <span>Logout</span>
        </span>

        <span className="profile_item_arrow">›</span>
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
