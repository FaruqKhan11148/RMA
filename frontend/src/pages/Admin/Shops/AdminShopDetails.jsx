import './AdminShopDetails.css';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ShopDetailsHeader from './AdminShopDetails/components/ShopDetailsHeader';
import ShopStats from './AdminShopDetails/components/ShopStats';
import OrderStatus from './AdminShopDetails/components/OrderStatus';
import RecentOrders from './AdminShopDetails/components/RecentOrders';

import { fetchShopStats } from './AdminShopDetails/utils/shopDetailsApi';

function AdminShopDetails() {
  const navigate = useNavigate();
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [stats, setStats] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadShopStats = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchShopStats(shopId);

        setShop(data.shop);
        setStats(data.stats);
        setOrderStatus(data.orderStatus);
        setRecentOrders(data.recentOrders || []);
      } catch (error) {
        console.error('Shop statistics fetch failed:', error);

        setError(error.message || 'Unable to load shop statistics');
      } finally {
        setLoading(false);
      }
    };

    loadShopStats();
  }, [shopId]);

  if (loading) {
    return (
      <main className="admin-shop-details-page">
        <div className="admin-shop-details-state">
          Loading shop statistics...
        </div>
      </main>
    );
  }

  if (error || !shop || !stats) {
    return (
      <main className="admin-shop-details-page">
        <div className="admin-shop-details-state admin-shop-details-error">
          <h2>Unable to load shop</h2>

          <p>{error || 'Shop information is unavailable.'}</p>

          <button type="button" onClick={() => navigate('/admin/shops')}>
            ← Back to Shops
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shop-details-page">
      <ShopDetailsHeader shop={shop} onBack={() => navigate('/admin/shops')} />

      <ShopStats stats={stats} />

      <OrderStatus orderStatus={orderStatus} />

      <RecentOrders
        recentOrders={recentOrders}
        onOrderClick={(orderId) => navigate(`/admin/orders/${orderId}`)}
      />
    </main>
  );
}

export default AdminShopDetails;
