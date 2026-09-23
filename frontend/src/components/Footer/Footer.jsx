import './Footer.css';

import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, ShoppingCart, ClipboardList, Bell } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

function Footer() {
  const { t } = useLanguage();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count for footer badge
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/notifications',
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Fetch notification unread count failed:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  // Hide footer badge when user visits Messages
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

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
        to="/notifications"
        end
        className={({ isActive }) => `nav_item ${isActive ? 'active' : ''}`}
        onClick={async (event) => {
          try {
            const response = await fetch(
              'https://rma-backend-bo4a.onrender.com/api/customers/me',
              {
                credentials: 'include',
              },
            );

            if (!response.ok) {
              event.preventDefault();
              navigate('/customer/login');
            }
          } catch (error) {
            console.error('Customer authentication check failed:', error);
            event.preventDefault();
            navigate('/customer/login');
          }
        }}
      >
        <div className="nav_icon_wrapper">
          <Bell className="nav_icon" />

          {unreadCount > 0 && (
            <span className="notification_badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <span>Messages</span>
      </NavLink>
    </nav>
  );
}

export default Footer;
