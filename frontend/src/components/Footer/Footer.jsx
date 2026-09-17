import './Footer.css';

import { NavLink } from 'react-router-dom';
import { Home, Store, ShoppingCart, ClipboardList, Bike } from 'lucide-react';

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
        <Home className="nav_icon" />
        <span>{t.bottomNav.home}</span>
      </NavLink>

      <NavLink
        to="/find-shop"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <Store className="nav_icon" />
        <span>{t.bottomNav.shops}</span>
      </NavLink>

      <NavLink
        to="/cart"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <div className="nav_icon_wrapper">
          <ShoppingCart className="nav_icon" />

          {totalItems > 0 && <span className="cart_badge">{totalItems}</span>}
        </div>

        <span>Cart</span>
      </NavLink>

      <NavLink
        to="/orders"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <ClipboardList className="nav_icon" />
        <span>{t.bottomNav.orders}</span>
      </NavLink>

      <NavLink
        to="/delivery/orders"
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
      >
        <Bike className="nav_icon" />
        <span>Delivery</span>
      </NavLink>
    </nav>
  );
}

export default Footer;
