import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Wallet,
  History,
  MessageSquare,
} from 'lucide-react';

import FlashMessage from '../../../components/FlashMessage/FlashMessage';

import './DeliveryFooter.css';

function DeliveryFooter() {
  const [flashMessage, setFlashMessage] = useState('');

  const isAuthenticated =
    Boolean(sessionStorage.getItem('delivery_token')) &&
    Boolean(sessionStorage.getItem('delivery_person'));

  const handleProtectedNavigation = (event) => {
    if (isAuthenticated) {
      return;
    }

    event.preventDefault();

    setFlashMessage('Please login as a delivery partner to continue.');
  };

  return (
    <>
      <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      />

      <nav className="delivery_bottom_nav">
        <NavLink
          to="/delivery/dashboard"
          end
          onClick={handleProtectedNavigation}
          className={({ isActive }) =>
            `delivery_nav_item ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard className="delivery_nav_icon" />

          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/delivery/orders-delivery"
          onClick={handleProtectedNavigation}
          className={({ isActive }) =>
            `delivery_nav_item ${isActive ? 'active' : ''}`
          }
        >
          <Package className="delivery_nav_icon" />

          <span>Deliveries</span>
        </NavLink>

        <NavLink
          to="/delivery/earnings"
          onClick={handleProtectedNavigation}
          className={({ isActive }) =>
            `delivery_nav_item ${isActive ? 'active' : ''}`
          }
        >
          <Wallet className="delivery_nav_icon" />

          <span>Earnings</span>
        </NavLink>

        <NavLink
          to="/delivery/history"
          onClick={handleProtectedNavigation}
          className={({ isActive }) =>
            `delivery_nav_item ${isActive ? 'active' : ''}`
          }
        >
          <History className="delivery_nav_icon" />

          <span>History</span>
        </NavLink>

        <NavLink
          to="/notifications"
          onClick={handleProtectedNavigation}
          className={({ isActive }) =>
            `delivery_nav_item ${isActive ? 'active' : ''}`
          }
        >
          <MessageSquare className="delivery_nav_icon" />

          <span>Messages</span>
        </NavLink>
      </nav>
    </>
  );
}

export default DeliveryFooter;
