import './OwnerFooter.css';

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  IndianRupee,
  Gift,
  Store,
} from 'lucide-react';

function OwnerFooter() {
  return (
    <nav className="owner_bottom_nav">
      <NavLink
        to="/owner/dashboard"
        end
        className={({ isActive }) =>
          `owner_nav_item ${isActive ? 'active' : ''}`
        }
      >
        <LayoutDashboard className="owner_nav_icon" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/owner/orders"
        end
        className={({ isActive }) =>
          `owner_nav_item ${isActive ? 'active' : ''}`
        }
      >
        <ClipboardList className="owner_nav_icon" />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to="/owner/earnings"
        end
        className={({ isActive }) =>
          `owner_nav_item ${isActive ? 'active' : ''}`
        }
      >
        <IndianRupee className="owner_nav_icon" />
        <span>Earnings</span>
      </NavLink>

      <NavLink
        to="/owner/offers"
        end
        className={({ isActive }) =>
          `owner_nav_item ${isActive ? 'active' : ''}`
        }
      >
        <Gift className="owner_nav_icon" />
        <span>Offers</span>
      </NavLink>

      <NavLink
        to="/owner/shop"
        end
        className={({ isActive }) =>
          `owner_nav_item ${isActive ? 'active' : ''}`
        }
      >
        <Store className="owner_nav_icon" />
        <span>Shop</span>
      </NavLink>
    </nav>
  );
}

export default OwnerFooter;
