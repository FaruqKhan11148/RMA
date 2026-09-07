import './SiteFooter.css';

import { useNavigate } from 'react-router-dom';

function SiteFooter() {
  const navigate = useNavigate();

  return (
    <footer className="site_footer">
      <div className="site_footer_container">
        {/* COLUMN 1 — RMA */}
        <div className="footer_column footer_brand_column">
          <button className="footer_logo" onClick={() => navigate('/')}>
            RMA
          </button>

          <p className="footer_description">
            Fresh meat and seafood from your local shops, delivered conveniently
            to your doorstep.
          </p>
        </div>

        {/* COLUMN 2 — CUSTOMERS */}
        <div className="footer_column">
          <h3>For Customers</h3>

          <button onClick={() => navigate('/find-shop')}>Find Shops</button>

          <button onClick={() => navigate('/scan-qr')}>Scan Shop QR</button>

          <button onClick={() => navigate('/orders')}>My Orders</button>

          <button onClick={() => navigate('/cart')}>Cart</button>
        </div>

        {/* COLUMN 3 — SHOP OWNERS */}
        <div className="footer_column">
          <h3>For Shop Owners</h3>

          <button onClick={() => navigate('/owner/register/step-1')}>
            Register Your Shop
          </button>

          <button onClick={() => navigate('/owner/login')}>Owner Login</button>

          <button onClick={() => navigate('/owner/dashboard')}>
            Owner Dashboard
          </button>

          <button onClick={() => navigate('/owner/register/step-1')}>
            Partner With RMA
          </button>
        </div>

        {/* COLUMN 4 — SUPPORT */}
        <div className="footer_column">
          <h3>Support & Legal</h3>

          <button onClick={() => navigate('/profile/help-support')}>
            Help & Support
          </button>

          <button onClick={() => navigate('/contact')}>Contact Us</button>

          <button onClick={() => navigate('/privacy')}>Privacy Policy</button>

          <button onClick={() => navigate('/terms')}>Terms & Conditions</button>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="site_footer_bottom">
        <p>© 2026 RMA. All rights reserved.</p>

        <p>Fresh. Local. Convenient.</p>
      </div>
    </footer>
  );
}

export default SiteFooter;
