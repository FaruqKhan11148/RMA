import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerRecentOrders from './components/OwnerRecentOrders';
import { fetchOwnerEarnings } from './utils/ownerEarningsApi';

function OwnerRecentEarnings() {
  const navigate = useNavigate();

  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ownerId, setOwnerId] = useState(null);

  const loadRecentEarnings = async () => {
    try {
      setLoading(true);
      setError('');

      const storedOwner = localStorage.getItem('rma_owner');

      if (!storedOwner) {
        throw new Error('Owner session not found');
      }

      const owner = JSON.parse(storedOwner);

      if (!owner?.id) {
        throw new Error('Invalid owner session');
      }

      setOwnerId(owner.id);

      const data = await fetchOwnerEarnings(owner.id);
      setRecentEarnings(data.recentEarnings || []);
    } catch (error) {
      console.error('Fetch recent earnings failed:', error);
      setError(error.message || 'Failed to load recent earnings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentEarnings();
  }, []);

  useEffect(() => {
    const loadRecentEarnings = async () => {
      try {
        setLoading(true);
        setError('');

        const storedOwner = localStorage.getItem('rma_owner');

        if (!storedOwner) {
          throw new Error('Owner session not found');
        }

        const owner = JSON.parse(storedOwner);

        if (!owner?.id) {
          throw new Error('Invalid owner session');
        }

        const data = await fetchOwnerEarnings(owner.id);

        setRecentEarnings(data.recentEarnings || []);
      } catch (error) {
        console.error('Fetch recent earnings failed:', error);

        setError(error.message || 'Failed to load recent earnings.');
      } finally {
        setLoading(false);
      }
    };

    loadRecentEarnings();
  }, []);

  return (
    <main className="owner_earnings_page">
      <div className="owner_recent_earnings_header">
        <button
          type="button"
          className="owner_recent_earnings_back"
          onClick={() => navigate('/owner/earnings')}
        >
          ← Back to Earnings
        </button>

        <h1>Recent Earnings</h1>

        <p>View your recent orders and their earnings details.</p>
      </div>

      {loading ? (
        <div className="owner_earnings_loading">
          <div className="owner_earnings_spinner" />
          <p>Loading recent earnings...</p>
        </div>
      ) : error ? (
        <div className="owner_earnings_error">
          <h2>Unable to load recent earnings</h2>
          <p>{error}</p>
        </div>
      ) : (
        <OwnerRecentOrders
          recentEarnings={recentEarnings}
          ownerId={ownerId}
          onArchived={loadRecentEarnings}
        />
      )}
    </main>
  );
}

export default OwnerRecentEarnings;
