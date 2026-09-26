import { useEffect, useState } from 'react';

import './DeliveryHistory.css';

import HistoryHeader from './components/HistoryHeader';
import HistoryLoading from './components/HistoryLoading';
import HistoryError from './components/HistoryError';
import HistoryEmpty from './components/HistoryEmpty';
import HistoryList from './components/HistoryList';

import { fetchDeliveryHistory } from './utils/historyApi';

function DeliveryHistory() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const data = await fetchDeliveryHistory(token);

        setOrders(data.orders?.allDelivered || []);
      } catch (fetchError) {
        console.error('Fetch delivery history failed:', fetchError);

        setError('Unable to load delivery history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <main className="delivery_history_page">
      <HistoryHeader orderCount={orders.length} />

      {loading && <HistoryLoading />}

      {!loading && error && <HistoryError error={error} />}

      {!loading && !error && orders.length === 0 && <HistoryEmpty />}

      {!loading && !error && orders.length > 0 && (
        <HistoryList orders={orders} />
      )}
    </main>
  );
}

export default DeliveryHistory;
