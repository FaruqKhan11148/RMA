// import './Navbar.css';

// import { useLanguage } from '../../context/LanguageContext';
// import { useNavigate } from 'react-router-dom';

// function Navbar() {
//   const { language, setLanguage } = useLanguage();
//   const navigate = useNavigate();

//   return (
//     <header className="navbar">
//       <button className="navbar_logo" onClick={() => navigate('/')}>
//         RMA
//       </button>

//       <div className="navbar_right">
//         <button
//           className="navbar_owner_register_button"
//           onClick={() => navigate('/owner/register/step-1')}
//         >
//           Owner Register
//         </button>

//         <select
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//           className="language_selector"
//         >
//           <option value="en">English</option>
//           <option value="kn">ಕನ್ನಡ</option>
//           <option value="hi">हिन्दी</option>
//           <option value="mr">मराठी</option>
//         </select>

//         <button className="navbar_profile" onClick={() => navigate('/profile')}>
//           Profile
//         </button>
//       </div>
//     </header>
//   );
// }

// export default Navbar;

import './Navbar.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('rma_navbar_offset', !isHomePage);

    return () => {
      document.body.classList.remove('rma_navbar_offset');
    };
  }, [isHomePage]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={[
        'rma_navbar',
        isVisible ? 'rma_navbar_visible' : 'rma_navbar_hidden',
        isHomePage ? 'rma_navbar_home' : 'rma_navbar_inner_page',
      ].join(' ')}
    >
      <div className="rma_navbar_inner">
        <div className="rma_navbar_brand">
          <span className="rma_navbar_brand_name">RMA</span>

          <span className="rma_navbar_brand_tagline">RAW MEAT APPLICATION</span>
        </div>

        <button
          type="button"
          className="rma_navbar_profile"
          onClick={() => navigate('/profile')}
          aria-label="Profile"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M4 21C4.8 16.8 7.4 14 12 14C16.6 14 19.2 16.8 20 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
