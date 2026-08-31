import './Home.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useState } from 'react';

function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [deliveryLocation, setDeliveryLocation] = useState(null);

  return (
    <main className="home">
      <section className="home_header">
        <p className="home_greeting">{t.home.greeting}</p>

        <h1>{t.home.title}</h1>

        <p>{t.home.description}</p>
      </section>

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

      <section className="my_shops">
        <div className="section_title">
          <h2>{t.home.myShops}</h2>

          <button>{t.home.viewAll}</button>
        </div>

        <div className="shop_card">
          <div className="shop_card_info">
            <h3>Rahman Chicken Center</h3>

            <p>Chicken • Fish • Seafood</p>

            <span>{t.home.lastOrdered} 2 days ago</span>
          </div>

          <button className="shop_order_button">{t.home.order}</button>
        </div>
      </section>
    </main>
  );
}

export default Home;
