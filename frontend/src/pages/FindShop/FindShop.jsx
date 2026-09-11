import './FindShop.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FindShop() {
  const [shopId, setShopId] = useState('');
  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrustedShop = async () => {
      const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

      if (!trustedShopId) {
        setShop(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        setShopError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/shop/${trustedShopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch trusted shop error:', error);

        setShopError('Unable to load your shop.');
        setShop(null);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchTrustedShop();
  }, []);

  const handleOrder = () => {
    const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

    if (!trustedShopId) {
      return;
    }

    navigate(`/shop/${trustedShopId}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!shopId.trim()) {
      return;
    }

    navigate(`/shop/${shopId.trim()}`);
  };

  return (
    <main className="find_shop">
      <div className="find_shop_content">
        {/* MY SHOP */}

        <section className="find_shop_my_shop">
          <div className="find_shop_section_title">
            <h2>My Shop</h2>
          </div>

          {loadingShop && (
            <div className="find_shop_message">Loading shop...</div>
          )}

          {shopError && (
            <div className="find_shop_message find_shop_error">{shopError}</div>
          )}

          {!loadingShop && !shop && !shopError && (
            <div className="find_shop_message">
              <h3>No shop added yet</h3>

              <p>
                Scan a shop QR code or enter a Shop ID to find your local meat
                shop.
              </p>
            </div>
          )}

          {!loadingShop && shop && (
            <div className="find_shop_card">
              <div className="find_shop_card_info">
                <h3>{shop.shopName}</h3>

                <p>{shop.description || 'Fresh meat and seafood'}</p>

                <span>{shop.address}</span>
              </div>

              <button
                type="button"
                className="find_shop_order_button"
                onClick={handleOrder}
              >
                Order →
              </button>
            </div>
          )}
        </section>

        {/* FIND / SCAN */}

        <section className="find_shop_search">
          <h1>Find Your Shop</h1>

          <p>Scan your local shop's QR code or enter the unique RMA Shop ID.</p>

          <button
            type="button"
            className="find_shop_scan_button"
            onClick={() => navigate('/scan-qr')}
          >
            <span className="find_shop_scan_icon">QR</span>

            <span>Scan Shop QR</span>
          </button>

          <div className="find_shop_or">
            <span>OR</span>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="shopId">Shop ID</label>

            <input
              id="shopId"
              type="text"
              placeholder="Example: RMA-000001"
              value={shopId}
              onChange={(event) => setShopId(event.target.value)}
            />

            <button type="submit">Continue</button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default FindShop;
