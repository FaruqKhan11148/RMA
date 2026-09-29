import {
  ShoppingBag,
  Languages,
  Palette,
  Info,
  MessageCircle,
  CircleHelp,
} from 'lucide-react';

function GuestProfile({ t, navigate, setLoginSheetOpen }) {
  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">R</div>

        <h1>Your RMA Account</h1>

        <p>Sign in to make ordering faster and easier.</p>
      </section>

      <section className="profile_auth">
        <button
          className="profile_auth_button login_button"
          onClick={() => setLoginSheetOpen(true)}
        >
          <div className="profile_auth_content">
            <strong>Login to RMA</strong>

            <span style={{ fontWeight: '600', color: 'white' }}>
              Customer, Shop Owner or Delivery Partner
            </span>
          </div>

          <span className="profile_arrow">›</span>
        </button>

        <button
          className="profile_auth_button signup_button"
          onClick={() => navigate('/customer/signup')}
        >
          <div className="profile_auth_content">
            <strong>Create Account</strong>

            <span>Save your details and order faster</span>
          </div>

          <span className="profile_arrow">›</span>
        </button>
      </section>

      <section className="profile_guest_card">
        <div className="profile_guest_icon">✓</div>

        <div>
          <h2>Prefer not to sign in?</h2>

          <p>
            No problem. You can continue shopping and place orders as a guest.
          </p>
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
    </main>
  );
}

export default GuestProfile;
