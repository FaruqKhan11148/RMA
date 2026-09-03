import './Navbar.css';

import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <button className="navbar_logo" onClick={() => navigate('/')}>
        RMA
      </button>

      <div className="navbar_right">
        <button
          className="navbar_owner_register_button"
          onClick={() => navigate('/owner/register/step-1')}
        >
          Owner Register
        </button>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language_selector"
        >
          <option value="en">English</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="hi">हिन्दी</option>
          <option value="mr">मराठी</option>
        </select>

        <button className="navbar_profile" onClick={() => navigate('/profile')}>
          Profile
        </button>
      </div>
    </header>
  );
}

export default Navbar;
