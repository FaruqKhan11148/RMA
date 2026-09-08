import './Profile.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          setCustomer(null);
          return;
        }

        const data = await response.json();

        setCustomer(data.customer);
      } catch (error) {
        console.error('Fetch customer profile failed:', error);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/customers/logout',
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setCustomer(null);

      navigate('/');
    } catch (error) {
      console.error('Customer logout failed:', error);
    }
  };

  if (loading) {
    return (
      <main className="profile">
        <section className="profile_loading">
          <div className="profile_loading_spinner" />
          <p>Loading your profile...</p>
        </section>
      </main>
    );
  }

  // ============================
  // LOGGED-IN CUSTOMER
  // ============================
  if (customer) {
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
      </main>
    );
  }

  // ============================
  // GUEST CUSTOMER
  // ============================
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
          onClick={() => navigate('/customer/login')}
        >
          <div className="profile_auth_content">
            <strong>Login</strong>

            <span>Access your orders and saved details</span>
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

export default Profile;
