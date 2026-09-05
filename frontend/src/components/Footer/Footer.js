import './Footer.css';

import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

function Footer() {
  const { t } = useLanguage();
  const { totalItems } = useCart();

  return (
    <nav className="bottom_nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <span>{t.bottomNav.home}</span>
      </NavLink>

      <NavLink
        to="/find-shop"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <span>{t.bottomNav.shops}</span>
      </NavLink>

      <NavLink
        to="/cart"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
      </NavLink>

      <NavLink
        to="/orders"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <span>{t.bottomNav.orders}</span>
      </NavLink>

      <NavLink
        to="/delivery/orders"
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <span>Delivery</span>
      </NavLink>
    </nav>
  );
}

export default Footer;
