import { useEffect, useState } from 'react';

import './DeliveryEarnings.css';

import EarningsHeader from './components/EarningsHeader';
import TotalEarnings from './components/TotalEarnings';
import EarningsSummary from './components/EarningsSummary';
import RecentEarnings from './components/RecentEarnings';

import { fetchEarnings } from './utils/earningsApi';

function DeliveryEarnings() {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    weekEarnings: 0,
    recentEarnings: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const data = await fetchEarnings(token);

        setEarnings({
          totalEarnings: data.totalEarnings || 0,
          todayEarnings: data.todayEarnings || 0,
          weekEarnings: data.weekEarnings || 0,
          recentEarnings: data.recentEarnings || [],
        });
      } catch (err) {
        console.error('Fetch delivery earnings failed:', err);

        setError('Unable to load earnings');
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  return (
    <main className="delivery_earnings_page">
      <EarningsHeader />

      {loading ? (
        <section className="delivery_earnings_empty">
          <strong>Loading earnings...</strong>

          <p>Please wait.</p>
        </section>
      ) : error ? (
        <section className="delivery_earnings_empty">
          <strong>{error}</strong>

          <p>Please try again later.</p>
        </section>
      ) : (
        <>
          <TotalEarnings totalEarnings={earnings.totalEarnings} />

          <EarningsSummary
            todayEarnings={earnings.todayEarnings}
            weekEarnings={earnings.weekEarnings}
          />

          <RecentEarnings recentEarnings={earnings.recentEarnings} />
        </>
      )}
    </main>
  );
}

export default DeliveryEarnings;
