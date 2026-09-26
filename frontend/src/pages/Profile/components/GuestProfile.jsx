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
          <span>{t.bottomNav.orders}</span>
          <span>›</span>
        </button>
      </section>

      <section className="profile_section">
        <h2>Preferences</h2>

        <button className="profile_item">
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
    </main>
  );
}

export default GuestProfile;
