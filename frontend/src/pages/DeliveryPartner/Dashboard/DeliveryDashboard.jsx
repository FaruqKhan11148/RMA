import './DeliveryDashboard.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DeliveryDashboardHeader from './components/DeliveryDashboardHeader';
import DeliveryStatusCard from './components/DeliveryStatusCard';
import DeliverySummary from './components/DeliverySummary';
import ActiveDelivery from './components/ActiveDelivery';
import DeliveryRequests from './components/DeliveryRequests';
import DeliveryArea from './components/DeliveryArea';

import { fetchDeliveryDashboard } from './utils/deliveryDashboardApi';
import {
  getPartnerName,
  calculateTodayEarnings,
} from './utils/deliveryDashboardHelpers';

function DeliveryDashboard() {
  const navigate = useNavigate();

  const [deliveryPartner, setDeliveryPartner] = useState(null);

  const [dashboard, setDashboard] = useState({
    today: {
      orders: 0,
      pending: 0,
      completed: 0,
    },
    allTime: {
      delivered: 0,
    },
    orders: {
      today: [],
      pending: [],
      completedToday: [],
      allDelivered: [],
    },
  });

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('delivery_token');

    if (!token) {
      navigate('/delivery-Partner/login');
      return;
    }

    const storedPartner = sessionStorage.getItem('delivery_person');

    if (storedPartner) {
      try {
        const parsedPartner = JSON.parse(storedPartner);

        setDeliveryPartner(parsedPartner);
        setIsOnline(Boolean(parsedPartner?.isActive));
      } catch (parseError) {
        console.error('Failed to parse delivery partner:', parseError);
      }
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchDeliveryDashboard(token);

        setDashboard({
          today: {
            orders: data.today?.orders || 0,
            pending: data.today?.pending || 0,
            completed: data.today?.completed || 0,
          },

          allTime: {
            delivered: data.allTime?.delivered || 0,
          },

          orders: {
            today: data.orders?.today || [],
            pending: data.orders?.pending || [],
            completedToday: data.orders?.completedToday || [],
            allDelivered: data.orders?.allDelivered || [],
          },
        });
      } catch (fetchError) {
        console.error('Fetch delivery dashboard failed:', fetchError);

        setError('Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const partnerName = getPartnerName(deliveryPartner);

  const activeDelivery = dashboard.orders.pending?.[0] || null;

  const todayEarnings = calculateTodayEarnings(dashboard.orders.completedToday);

  const handleToggleOnline = () => {
    setIsOnline((previous) => !previous);
  };

  return (
    <main className="delivery_dashboard">
      <DeliveryDashboardHeader partnerName={partnerName} isOnline={isOnline} />

      <DeliveryStatusCard isOnline={isOnline} onToggle={handleToggleOnline} />

      {error && (
        <section className="delivery_empty_card">
          <strong>{error}</strong>

          <p>Please refresh the page and try again.</p>
        </section>
      )}

      {loading ? (
        <section className="delivery_empty_card">
          <strong>Loading dashboard...</strong>

          <p>Please wait.</p>
        </section>
      ) : (
        <>
          <DeliverySummary
            todayEarnings={todayEarnings}
            today={dashboard.today}
          />

          <ActiveDelivery
            activeDelivery={activeDelivery}
            onViewDelivery={(orderId) =>
              navigate(`/delivery/orders-delivery?orderId=${orderId}`)
            }
          />

          <DeliveryRequests pending={dashboard.today.pending} />

          <DeliveryArea todayOrders={dashboard.today.orders} />
        </>
      )}
    </main>
  );
}

export default DeliveryDashboard;
