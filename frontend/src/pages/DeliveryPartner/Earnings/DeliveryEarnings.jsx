import { useEffect, useState } from 'react';
import { IndianRupee, TrendingUp, CalendarDays } from 'lucide-react';

import './DeliveryEarnings.css';

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
    const fetchEarnings = async () => {
      try {
        const token = sessionStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/delivery/earnings',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load earnings');
        }

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

    fetchEarnings();
  }, []);

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  return (
    <main className="delivery_earnings_page">
      <header className="delivery_earnings_header">
        <div>
          <span>Delivery Partner</span>
          <h1>Earnings</h1>
        </div>
      </header>

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
          <section className="delivery_total_earnings">
            <div className="delivery_total_earnings_icon">
              <IndianRupee size={22} />
            </div>

            <span>Total Earnings</span>

            <strong>{formatAmount(earnings.totalEarnings)}</strong>

            <p>Your earnings from completed deliveries.</p>
          </section>

          <section className="delivery_earnings_grid">
            <div className="delivery_earning_card">
              <div className="delivery_earning_icon">
                <IndianRupee size={18} />
              </div>

              <span>Today</span>

              <strong>{formatAmount(earnings.todayEarnings)}</strong>
            </div>

            <div className="delivery_earning_card">
              <div className="delivery_earning_icon">
                <TrendingUp size={18} />
              </div>

              <span>This Week</span>

              <strong>{formatAmount(earnings.weekEarnings)}</strong>
            </div>
          </section>

          <section className="delivery_earnings_section">
            <div className="delivery_earnings_section_header">
              <div>
                <h2>Recent Earnings</h2>

                <span>Completed delivery payments</span>
              </div>

              <CalendarDays size={20} />
            </div>

            {earnings.recentEarnings.length === 0 ? (
              <div className="delivery_earnings_empty">
                <strong>No earnings yet</strong>

                <p>Complete your first delivery to see your earnings here.</p>
              </div>
            ) : (
              <div className="delivery_recent_earnings">
                {earnings.recentEarnings.map((earning) => (
                  <div
                    className="delivery_recent_earning"
                    key={earning.orderId}
                  >
                    <div>
                      <strong>{earning.orderId}</strong>

                      <span>
                        {earning.completedAt
                          ? new Date(earning.completedAt).toLocaleDateString(
                              'en-IN',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )
                          : '—'}
                      </span>
                    </div>

                    <strong>{formatAmount(earning.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default DeliveryEarnings;
