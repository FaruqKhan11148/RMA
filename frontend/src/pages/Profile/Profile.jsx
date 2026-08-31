import './Profile.css';

import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <main className="profile">
      <section className="profile_header">
        <div className="profile_avatar">F</div>

        <h1>Faruq</h1>

        <p>Customer</p>
      </section>

      <section className="profile_section">
        <h2>My Account</h2>

        <button className="profile_item">
          <span>Personal Details</span>
          <span>›</span>
        </button>

        <button className="profile_item">
          <span>Saved Addresses</span>
          <span>›</span>
        </button>
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

        <button className="profile_item">
          <span>Help & Support</span>
          <span>›</span>
        </button>
      </section>

      <button className="logout_button">Logout</button>
    </main>
  );
}

export default Profile;
