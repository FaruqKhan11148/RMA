import './AdminDailyOrders.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DailyOrdersHeader from './components/DailyOrders/DailyOrdersHeader';
import DailyOrdersSummary from './components/DailyOrders/DailyOrdersSummary';
import DailyOrdersStatus from './components/DailyOrders/DailyOrdersStatus';
import DailyOrdersShopPerformance from './components/DailyOrders/DailyOrdersShopPerformance';
import DailyOrdersTable from './components/DailyOrders/DailyOrdersTable';

import { fetchDailyOrders } from './utils/DailyOrders/dailyOrdersApi';

import {
  formatCurrency,
  formatDateTime,
} from './utils/DailyOrders/dailyOrdersHelpers';

function AdminDailyOrders() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDailyOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await fetchDailyOrders();

        setData(result);
      } catch (error) {
        console.error('Admin daily orders fetch error:', error);

        if (error.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(error.message || 'Failed to load daily orders');
      } finally {
        setLoading(false);
      }
    };

    loadDailyOrders();
  }, [navigate]);

  if (loading) {
    return (
      <main className="admin-daily-orders-page">
        <div className="admin-daily-orders-state">
          Loading today's orders...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="admin-daily-orders-page">
        <div className="admin-daily-orders-error">
          <h2>Unable to load daily orders</h2>

          <p>{error || 'Something went wrong.'}</p>

          <button type="button" onClick={() => navigate('/admin/dashboard')}>
            ← Dashboard
          </button>
        </div>
      </main>
    );
  }

  const stats = data.stats || {};
  const orderStatus = data.orderStatus || {};
  const shops = data.shops || [];
  const orders = data.orders || [];

  return (
    <main className="admin-daily-orders-page">
      <DailyOrdersHeader
        date={data.date}
        onBack={() => navigate('/admin/dashboard')}
      />

      <DailyOrdersSummary stats={stats} formatCurrency={formatCurrency} />

      <DailyOrdersStatus orderStatus={orderStatus} />

      <DailyOrdersShopPerformance
        shops={shops}
        formatCurrency={formatCurrency}
      />

      <DailyOrdersTable
        orders={orders}
        formatCurrency={formatCurrency}
        formatDateTime={formatDateTime}
        onViewOrder={(orderId) => navigate(`/admin/orders/${orderId}`)}
      />
    </main>
  );
}

export default AdminDailyOrders;
