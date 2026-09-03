import './Home.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState('');

  // Temporary test shop.
  // Later this will come from the customer's scanned QR/history.
  const testShopId = 'RMA-000005';

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoadingShop(true);
        setShopError('');

        const response = await fetch(
          `https://rma-backend-bo4a.onrender.com/api/owners/shop/${testShopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShop(data);
      } catch (error) {
        console.error('Fetch shop error:', error);
        setShopError('Unable to load shop.');
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShop();
  }, []);

  const handleOrder = () => {
    if (!shop) return;

    navigate(`/shop/${testShopId}`);
  };

  return (
    <main className="home">
      {/* HEADER */}

      <section className="home_header">
        <p className="home_greeting">{t.home.greeting}</p>

        <h1>{t.home.title}</h1>

        <p>{t.home.description}</p>
      </section>

      {/* ACTIONS */}

      <section className="home_actions">
        <button className="qr_action" onClick={() => navigate('/scan-qr')}>
          <div className="action_icon">QR</div>

          <div className="action_content">
            <h2>{t.home.scanQr}</h2>

            <p>{t.home.scanQrDescription}</p>
          </div>
        </button>

        <button className="find_action" onClick={() => navigate('/find-shop')}>
          <span className="find_icon">🔍</span>

          <span>{t.home.findShop}</span>
        </button>
      </section>

      {/* MY SHOPS */}

      <section className="my_shops">
        <div className="section_title">
          <h2>{t.home.myShops}</h2>

          <button>{t.home.viewAll}</button>
        </div>

        {loadingShop && <div className="shop_loading">Loading shop...</div>}

        {shopError && <div className="shop_error">{shopError}</div>}

        {!loadingShop && shop && (
          <div className="shop_card">
            <div className="shop_card_info">
              <h3>{shop.shopName}</h3>

              <p>{shop.description || 'Fresh meat and seafood'}</p>

              <span>{shop.address}</span>
            </div>

            <button className="shop_order_button" onClick={handleOrder}>
              {t.home.order}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;
