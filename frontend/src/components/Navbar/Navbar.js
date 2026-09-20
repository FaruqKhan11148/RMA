import './Navbar.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const [isVisible, setIsVisible] = useState(true);
  const [showAppModal, setShowAppModal] = useState(false);

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
      } else {
        setIsVisible(currentScrollY <= lastScrollY);
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

        <div className="rma_navbar_app">
          <button
            type="button"
            className="rma_navbar_app_button"
            onClick={() => setShowAppModal(true)}
            aria-label="Download RMA app"
          >
            <span className="rma_navbar_app_text">Download RMA App</span>

            <span className="rma_navbar_app_icon">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 4V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M7 11L12 16L17 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M5 20H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
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
      {showAppModal && (
        <div
          className="rma_app_modal_overlay"
          onClick={() => setShowAppModal(false)}
        >
          <section
            className="rma_app_modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rma-app-modal-title"
          >
            <button
              type="button"
              className="rma_app_modal_close"
              onClick={() => setShowAppModal(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="rma_app_modal_icon">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M8 12H16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M12 8V16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 id="rma-app-modal-title">RMA Mobile App</h2>

            <p className="rma_app_modal_message">
              Our mobile app isn't available yet.
            </p>

            <p>
              But don't worry — we're working on it and plan to make it
              available before <strong>1 October 2026</strong>.
            </p>

            <p>
              Soon you'll be able to find local meat shops, place orders, track
              deliveries and manage everything directly from the RMA app.
            </p>

            <div className="rma_app_modal_note">
              <span>Coming soon</span>
              <span>RMA on mobile</span>
            </div>

            <button
              type="button"
              className="rma_app_modal_button"
              onClick={() => setShowAppModal(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </header>
  );
}

export default Navbar;
