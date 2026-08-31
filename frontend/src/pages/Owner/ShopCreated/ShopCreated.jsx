import './ShopCreated.css';

import { useLocation, useNavigate } from 'react-router-dom';
import ShopQRCode from '../../../components/ShopQRCode/ShopQRCode';

function ShopCreated() {
  const location = useLocation();
  const navigate = useNavigate();

  const owner = location.state?.owner;

  // If someone opens this page directly without registering
  if (!owner) {
    return (
      <main className="shop_created">
        <section className="shop_created_card">
          <h1>Shop information not found</h1>

          <p>Please register your shop first.</p>

          <button
            className="shop_created_button"
            onClick={() => navigate('/owner/register')}
          >
            Register Shop
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shop_created">
      <section className="shop_created_card">
        {/* SUCCESS */}

        <div className="shop_created_success_icon">✓</div>

        <div className="shop_created_header">
          <h1>Shop Created Successfully</h1>

          <p>Your shop has been registered with RMA.</p>
        </div>

        {/* SHOP INFORMATION */}

        <section className="shop_created_info">
          <div className="shop_created_info_row">
            <span>Shop Name</span>

            <strong>{owner.shopName}</strong>
          </div>

          <div className="shop_created_info_row">
            <span>Owner</span>

            <strong>{owner.ownerName}</strong>
          </div>

          <div className="shop_created_info_row">
            <span>Mobile Number</span>

            <strong>{owner.phone}</strong>
          </div>
        </section>

        {/* SHOP NUMBER */}

        <section className="shop_number_section">
          <p>Your RMA Shop Number</p>

          <strong className="shop_number">{owner.shopId}</strong>

          <span>Use this number to identify your shop.</span>
        </section>

        {/* QR CODE */}

        <ShopQRCode shopId={owner.shopId} />

        {/* ACTIONS */}

        <div className="shop_created_actions">
          <button
            className="shop_created_button primary"
            onClick={() => navigate('/owner/dashboard')}
          >
            Go to Dashboard
          </button>

          <button
            className="shop_created_button secondary"
            onClick={() => navigate('/owner/login')}
          >
            Go to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default ShopCreated;
