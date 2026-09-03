import './Footer.css';

import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function Footer() {
  const { t } = useLanguage();

  const navigate = useNavigate();

  const { totalItems } = useCart();

  return (
    <nav className="bottom_nav">
      <button className="nav_item active" onClick={() => navigate('/')}>
        <span>{t.bottomNav.home}</span>
      </button>

      <button className="nav_item" onClick={() => navigate('/find-shop')}>
        <span>{t.bottomNav.shops}</span>
      </button>

      <button className="nav_item" onClick={() => navigate('/cart')}>
        <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
      </button>

      <button className="nav_item" onClick={() => navigate('/orders')}>
        <span>{t.bottomNav.orders}</span>
      </button>

      {/* DELIVERY */}

      <button className="nav_item" onClick={() => navigate('/delivery/orders')}>
        <span>Delivery</span>
      </button>
    </nav>
  );
}

export default Footer;
