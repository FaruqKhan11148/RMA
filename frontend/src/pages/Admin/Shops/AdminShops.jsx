import './AdminShops.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminShops() {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/owners',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch shops');
        }

        setShops(data.owners || []);
      } catch (error) {
        console.error('Admin shops fetch failed:', error);
        setError(error.message || 'Unable to load shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <main className="admin-shops-page">
      <header className="admin-shops-header">
        <div>
          <button
            className="admin-shops-back"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>

          <h1>Shops</h1>

          <p>View all registered RMA shops and their performance.</p>
        </div>

        <div className="admin-shops-count">
          {loading ? '...' : shops.length} Shops
        </div>
      </header>

      {loading && <div className="admin-shops-state">Loading shops...</div>}

      {error && <div className="admin-shops-error">{error}</div>}

      {!loading && !error && shops.length === 0 && (
        <div className="admin-shops-state">No shops registered yet.</div>
      )}

      {!loading && !error && shops.length > 0 && (
        <section className="admin-shops-grid">
          {shops.map((shop) => (
            <button
              type="button"
              className="admin-shop-card"
              key={shop.shopId}
              onClick={() => navigate(`/admin/shops/${shop.shopId}`)}
            >
              <div className="admin-shop-card-top">
                <span className="admin-shop-id">{shop.shopId}</span>

                <span className="admin-shop-arrow">→</span>
              </div>

              <h2>{shop.shopName || 'Unnamed Shop'}</h2>

              <p>Owner: {shop.ownerName || 'Unknown'}</p>

              <p>Phone: {shop.phone || 'Not available'}</p>
            </button>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminShops;
