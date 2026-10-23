import './Navbar.css';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const [isVisible, setIsVisible] = useState(true);
  const [showAppModal, setShowAppModal] = useState(false);

  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [isIOS, setIsIOS] = useState(false);

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

  const handleProfileClick = () => {
    const deliveryToken = localStorage.getItem('delivery_token');
    const deliveryPerson = localStorage.getItem('delivery_person');

    if (deliveryToken && deliveryPerson) {
      navigate('/delivery/profile');
      return;
    }

    const owner = localStorage.getItem('rma_owner');

    if (owner) {
      navigate('/owner/profile');
      return;
    }

    navigate('/customer/profile');
  };

  useEffect(() => {
    const checkInstallation = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

      setIsAppInstalled(standalone);
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
      setInstallMessage('RMA has been installed successfully.');
    };

    const userAgent = window.navigator.userAgent || '';
    const isAppleMobile =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (userAgent.includes('Macintosh') && window.navigator.maxTouchPoints > 1);

    setIsIOS(isAppleMobile);
    checkInstallation();

    const displayMode = window.matchMedia('(display-mode: standalone)');
    displayMode.addEventListener?.('change', checkInstallation);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      displayMode.removeEventListener?.('change', checkInstallation);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (isAppInstalled) {
      setInstallMessage('RMA is already installed on this device.');
      return;
    }

    if (!installPrompt) {
      if (isIOS) {
        setInstallMessage(
          'To install RMA on your iPhone or iPad, open this website in Safari, tap Share, then choose Add to Home Screen.',
        );
      } else {
        setInstallMessage(
          "To install RMA, open your browser's menu and look for Install app or Add to Home screen. If the option is missing, the website may not yet meet the browser's installation requirements.",
        );
      }

      return;
    }

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstallMessage('RMA installation was accepted by your browser.');
      } else {
        setInstallMessage(
          'Installation was cancelled. You can try again whenever you are ready.',
        );
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error('RMA installation prompt failed:', error);

      setInstallMessage(
        'The installation prompt could not be opened. Please try your browser menu instead.',
      );
    }
  };

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
          onClick={handleProfileClick}
          aria-label="Profile"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w 3.org/2000/svg"
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

            <h2 id="rma-app-modal-title">
              {isAppInstalled ? 'RMA Is Installed' : 'Install RMA App'}
            </h2>

            {installMessage ? (
              <p className="rma_app_modal_message" role="status">
                {installMessage}
              </p>
            ) : isAppInstalled ? (
              <p className="rma_app_modal_message">
                You can open RMA directly from your device's home screen.
              </p>
            ) : installPrompt ? (
              <>
                <p className="rma_app_modal_message">
                  Install RMA on your device for quick access to local meat
                  shops, ordering, payments, and delivery tracking.
                </p>

                <div className="rma_app_modal_note">
                  <span>Install available</span>
                  <span>RMA on your device</span>
                </div>
              </>
            ) : isIOS ? (
              <p>
                Open RMA in Safari, tap the Share button, and select{' '}
                <strong>Add to Home Screen</strong>.
              </p>
            ) : (
              <p>
                Open this website in Chrome and check the three-dot menu for{' '}
                <strong>Install app</strong> or{' '}
                <strong>Add to Home screen</strong>. If neither option appears,
                we need to verify the website's installation requirements.
              </p>
            )}

            <button
              type="button"
              className="rma_app_modal_button"
              onClick={
                isAppInstalled ? () => setShowAppModal(false) : handleInstallApp
              }
            >
              {isAppInstalled
                ? 'Done'
                : installPrompt
                  ? 'Install RMA App'
                  : 'Got it'}
            </button>
          </section>
        </div>
      )}
    </header>
  );
}

export default Navbar;
