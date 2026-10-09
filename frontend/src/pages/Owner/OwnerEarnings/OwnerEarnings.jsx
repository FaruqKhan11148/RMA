import './OwnerEarnings.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OwnerEarningsHeader from './components/OwnerEarningsHeader';
import OwnerEarningsTotal from './components/OwnerEarningsTotal';
import OwnerEarningsCards from './components/OwnerEarningsCards';

import { fetchOwnerEarnings } from './utils/ownerEarningsApi';

function OwnerEarnings() {
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEarnings = async () => {
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

        setEarnings({
          totalSettledEarnings: data.earnings?.totalSettledEarnings || 0,
          todayEarnings: data.earnings?.todayEarnings || 0,
          weekEarnings: data.earnings?.weekEarnings || 0,
          monthEarnings: data.earnings?.monthEarnings || 0,
          totalProductSales: data.earnings?.totalProductSales || 0,
          totalRmaFees: data.earnings?.totalRmaFees || 0,
          settledOrders: data.earnings?.settledOrders || 0,
          recentEarnings: data.recentEarnings || [],
        });
      } catch (error) {
        console.error('Fetch owner earnings failed:', error);
        setError(error.message || 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  if (loading) {
    return (
      <main className="owner_earnings_page">
        <div className="owner_earnings_loading">
          <div className="owner_earnings_spinner" />
          <p>Loading earnings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="owner_earnings_page">
        <div className="owner_earnings_error">
          <h2>Unable to load earnings</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="owner_earnings_page">
      <OwnerEarningsHeader />
      <OwnerEarningsTotal earnings={earnings} />
      <OwnerEarningsCards earnings={earnings} />

      <section className="owner_earnings_navigation">
        <h2>Explore Your Earnings</h2>
        <p>View order earnings and discover available rewards.</p>

        <div className="owner_earnings_navigation_grid">
          <button
            type="button"
            className="owner_earnings_navigation_card"
            onClick={() => navigate('/owner/earnings/recent')}
          >
            <span className="owner_earnings_navigation_icon">₹</span>
            <span className="owner_earnings_navigation_text">
              <strong>Recent Earnings</strong>
              <small>View recent orders and earning details</small>
            </span>
            <span className="owner_earnings_navigation_arrow">→</span>
          </button>

          <button
            type="button"
            className="owner_earnings_navigation_card"
            onClick={() => navigate('/owner/offers/referrals')}
          >
            <span className="owner_earnings_navigation_icon">↗</span>
            <span className="owner_earnings_navigation_text">
              <strong>Referral Offer Earnings</strong>
              <small>Track referrals and referral rewards</small>
            </span>
            <span className="owner_earnings_navigation_arrow">→</span>
          </button>

          <button
            type="button"
            className="owner_earnings_navigation_card"
            onClick={() => navigate('/owner/offers')}
          >
            <span className="owner_earnings_navigation_icon">25+</span>
            <span className="owner_earnings_navigation_text">
              <strong>Daily Order Offer</strong>
              <small>Check your daily order target and rewards</small>
            </span>
            <span className="owner_earnings_navigation_arrow">→</span>
          </button>
        </div>
      </section>
    </main>
  );
}

export default OwnerEarnings;
