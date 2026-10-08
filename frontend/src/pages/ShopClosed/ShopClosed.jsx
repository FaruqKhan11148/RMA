import './ShopClosed.css';

import { useNavigate, useLocation } from 'react-router-dom';

function ShopClosed() {
  const navigate = useNavigate();
  const location = useLocation();

  const shopName = location.state?.shopName || 'This shop';

  const handleBackToNearby = () => {
    navigate('/find-shop', { replace: true });
  };

  return (
    <main className="shop_closed">
      <section className="shop_closed_content">
        <div className="shop_closed_illustration" aria-hidden="true">
          <div className="shop_closed_cloud shop_closed_cloud_one" />
          <div className="shop_closed_cloud shop_closed_cloud_two" />
          <div className="shop_closed_sun" />

          <div className="shop_closed_store">
            <div className="shop_closed_store_roof">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="shop_closed_store_sign">
              <span>RMA</span>
            </div>

            <div className="shop_closed_store_body">
              <div className="shop_closed_store_window">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="shop_closed_store_door" />
            </div>

            <div className="shop_closed_store_base" />
          </div>

          <div className="shop_closed_ground" />
        </div>

        <div className="shop_closed_text">
          <span className="shop_closed_label">SHOP CLOSED</span>

          <h1>{shopName} is currently closed</h1>

          <p>
            This shop isn't accepting orders right now. Please check back later
            when the shop is open.
          </p>

          <button
            type="button"
            className="shop_closed_back_button"
            onClick={handleBackToNearby}
          >
            Back to Nearby Shops
          </button>
        </div>
      </section>
    </main>
  );
}

export default ShopClosed;
