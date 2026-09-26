import './AdminShops.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ShopsHeader from './AdminShops/components/ShopsHeader';
import ShopCard from './AdminShops/components/ShopCard';

import { fetchShops } from './AdminShops/utils/shopsApi';

function AdminShops() {
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoading(true);
        setError('');

        const shopData = await fetchShops();

        setShops(shopData);
      } catch (error) {
        console.error('Admin shops fetch failed:', error);
        setError(error.message || 'Unable to load shops');
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, []);

  return (
    <main className="admin-shops-page">
      <ShopsHeader
        loading={loading}
        shopCount={shops.length}
        onBack={() => navigate('/admin/dashboard')}
      />

      {loading && <div className="admin-shops-state">Loading shops...</div>}

      {error && <div className="admin-shops-error">{error}</div>}

      {!loading && !error && shops.length === 0 && (
        <div className="admin-shops-state">No shops registered yet.</div>
      )}

      {!loading && !error && shops.length > 0 && (
        <section className="admin-shops-grid">
          {shops.map((shop) => (
            <ShopCard
              key={shop.shopId}
              shop={shop}
              onClick={() => navigate(`/admin/shops/${shop.shopId}`)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminShops;
