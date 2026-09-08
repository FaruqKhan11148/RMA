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

  // ==========================================
  // RMA MEAT IMAGES
  // Replace these with your Cloudinary URLs
  // ==========================================

  const meatImages = [
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/HuNbApWSmQc9TvMcm31ZogyfUsbl1wA6KBdndBiI3vh39M_m0yUZ_1LGjXTrwgWIhIfew2gPb-PxXaVaTItYVcU6AUIulUU3xxDiVx0l7eYM8vlhvqM2tF91-JCYsZu8UgFgUhWezrFzcq94RvzhS9qW3mRmv40PHwwBH0puu9cuGlvFrSOSVkYJHL8pN_bl.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/rYKkTplP1CFqmXNxxpnxvf_Da5-LkcRD6slxlBH3-HBpeo4Fro5mFCDNo2aYtNYwgiqm3PWXyPeb9L2ZbpmpeCDTv6oWbTmQHL6HUMbPzjcZeJ946-zJyqc0zRhVk6DioJTJYGsDTiHbRCP0qxHiyB68uTO9_HBdzGXNfK9EjMS1xqsJVuas22DpDLVbkTsL.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692758/YXAoTCSnLmtzr1cckX1A5eVY1Jjq2McuzwVKDQEu9iZYeo3pUhak7P-ZI6LLTe82ZMh0j-7FwKo1Kx90mRJEdHyFKeh6cDEbpHII6zXFtWiH-m5Lon8EUPbVSaK9nCh7LuLOmtNMiNiqDfuJbp6NTI4JDs_yZiRtf0QVGZKrjwVN6xTVl2fepBv4FgMclLLx.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692746/6zXPm-qeheg-DOSWSfukVpbtMS7NiICY8PecMbFXQl8Bhlg4IQQc_w4UqTpFPSSI0GAuIyJVFB0eLEtavNeKLtfLNbfRWbhfLJFVzXRJgEZncrjGJPHd8qr7WH4_s8ZBvxbbosN4pQ7_OiFXFrnR5B9EedXDp2w1rsanRh2CPM_tZ37HIWlMdVGgWF8b-Qsa.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692737/HvH-wvV2Ns1JsiDwYYwiIYWBD_hqSX8kp1axRoAClbVhzgoWkE5TkikoHxnr2C0bQAw4aBUFLWycd27_90ebE8wSxKxrFrBI3SjSlEWRKqAxOQhgmSY4UWNMwVBfvq3JG4XYJmNwD3yDHiWKdGAJD3UzuZ2vrUT_oxr4PYw6Qc5cxr602P66rA5dFNzXo5SQ.jpg',
    'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692757/7W8FjPyWPZUer7tM7Vf1Ntr-yvriGGEZoIxfsb6GHEhWFboo2qh240DsoFOT6lZaT8sTSjQzIrUApTLiMrLG1Qs4HIRh1KZIL183xoSxb8VAWP7P_MJCjRWEa-bWvByIcPOgdtuoNUk3WtA5Fr0FONPBkkyp1ER2nJT-MRk6KSOU4Jur_0KCl5dejm-Nptwz.jpg',
  ];

  // ==========================================
  // FETCH TRUSTED SHOP
  // ==========================================

  useEffect(() => {
    const fetchShop = async () => {
      const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

      // No trusted shop yet.
      if (!trustedShopId) {
        setShop(null);
        setLoadingShop(false);
        return;
      }

      try {
        setLoadingShop(true);
        setShopError('');

        const response = await fetch(
          `http://localhost:5000/api/owners/shop/${trustedShopId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShop(data.shop);
      } catch (error) {
        console.error('Fetch shop error:', error);

        setShopError('Unable to load trusted shop.');

        setShop(null);
      } finally {
        setLoadingShop(false);
      }
    };

    fetchShop();
  }, []);

  // ==========================================
  // ORDER FROM TRUSTED SHOP
  // ==========================================

  const handleOrder = () => {
    if (!shop) return;

    const trustedShopId = localStorage.getItem('rma_trusted_shop_id');

    if (!trustedShopId) return;

    navigate(`/shop/${trustedShopId}`);
  };

  return (
    <main className="home">
      {/* ======================================
          HERO
          Sliding meat images + text
      ======================================= */}

      <section className="home_hero">
        {/* Sliding image track */}

        <div className="hero_image_track">
          {meatImages.map((image, index) => (
            <div className="hero_image" key={image}>
              <img src={image} alt={`Fresh meat ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Image overlay */}

        <div className="hero_overlay"></div>

        {/* Text placed ABOVE the images */}

        <div className="home_header">
          <p className="home_greeting">{t.home.greeting}</p>

          <h1>{t.home.title}</h1>

          <p>{t.home.description}</p>
        </div>
      </section>

      {/* ======================================
          CONTENT BELOW HERO
      ======================================= */}

      <div className="home_content">
        {/* ====================================
            ACTIONS
        ===================================== */}

        <section className="home_actions">
          {/* SCAN QR */}

          <button className="qr_action" onClick={() => navigate('/scan-qr')}>
            <div className="action_icon">QR</div>

            <div className="action_content">
              <h2>{t.home.scanQr}</h2>

              <p>{t.home.scanQrDescription}</p>
            </div>
          </button>

          {/* FIND SHOP */}

          <button
            className="find_action"
            onClick={() => navigate('/find-shop')}
          >
            <span className="find_icon">🔍</span>

            <span>{t.home.findShop}</span>
          </button>
        </section>

        {/* ====================================
            MY SHOPS
        ===================================== */}

        <section className="my_shops">
          <div className="section_title">
            <h2>{t.home.myShops}</h2>

            <button>{t.home.viewAll}</button>
          </div>

          {/* Loading */}

          {loadingShop && <div className="shop_loading">Loading shop...</div>}

          {/* Error */}

          {shopError && <div className="shop_error">{shopError}</div>}

          {/* Shop */}

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
      </div>
    </main>
  );
}

export default Home;
