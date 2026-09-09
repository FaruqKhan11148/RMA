import './AdminMonthlyFinance.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminMonthlyFinance() {
  const navigate = useNavigate();

  const getCurrentMonth = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    totalTransactionValue: 0,
    completedTransactionValue: 0,
    totalRmaFees: 0,
  });

  const [orderStatus, setOrderStatus] = useState({
    Pending: 0,
    Accepted: 0,
    Preparing: 0,
    Ready: 0,
    OutForDelivery: 0,
    Completed: 0,
    Rejected: 0,
  });

  const [shops, setShops] = useState([]);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toFixed(2)}`;
  };

  const formatStatus = (status) => {
    if (status === 'OutForDelivery') {
      return 'Out For Delivery';
    }

    return status;
  };

  const fetchMonthlyFinance = async (month) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/orders/monthly-finance?month=${month}`,
        {
          credentials: 'include',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch monthly finance');
      }

      setStats(
        data.stats || {
          totalOrders: 0,
          completedOrders: 0,
          paidOrders: 0,
          pendingOrders: 0,
          rejectedOrders: 0,
          totalTransactionValue: 0,
          completedTransactionValue: 0,
          totalRmaFees: 0,
        },
      );

      setOrderStatus(
        data.orderStatus || {
          Pending: 0,
          Accepted: 0,
          Preparing: 0,
          Ready: 0,
          OutForDelivery: 0,
          Completed: 0,
          Rejected: 0,
        },
      );

      setShops(data.shops || []);
    } catch (error) {
      console.error('Monthly finance fetch error:', error);
      setError(error.message || 'Failed to load monthly finance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyFinance(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="admin_monthly_finance_page">
      <div className="admin_monthly_finance_header">
        <div>
          <button
            type="button"
            className="admin_back_button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back
          </button>

          <h1>Monthly Finance</h1>

          <p>
            Revenue and transaction overview for{' '}
            <strong>{selectedMonth}</strong>
          </p>
        </div>

        <div className="admin_month_selector">
          <label htmlFor="finance_month">Select Month</label>

          <input
            id="finance_month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="admin_finance_message">Loading monthly finance...</div>
      )}

      {error && <div className="admin_finance_error">{error}</div>}

      {!loading && !error && (
        <>
          <section className="admin_finance_summary_grid">
            <div className="admin_finance_card">
              <span>Total Orders</span>
              <strong>{stats.totalOrders}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Completed Orders</span>
              <strong>{stats.completedOrders}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Paid Orders</span>
              <strong>{stats.paidOrders}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Pending Orders</span>
              <strong>{stats.pendingOrders}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Rejected Orders</span>
              <strong>{stats.rejectedOrders}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Total Transaction Value</span>
              <strong>{formatCurrency(stats.totalTransactionValue)}</strong>
            </div>

            <div className="admin_finance_card">
              <span>Completed Revenue</span>
              <strong>{formatCurrency(stats.completedTransactionValue)}</strong>
            </div>

            <div className="admin_finance_card admin_rma_fee_card">
              <span>RMA Fees (1%)</span>
              <strong>{formatCurrency(stats.totalRmaFees)}</strong>
            </div>
          </section>

          <section className="admin_finance_section">
            <div className="admin_finance_section_header">
              <h2>Order Status</h2>
            </div>

            <div className="admin_status_grid">
              {Object.entries(orderStatus).map(([status, count]) => (
                <div className="admin_status_card" key={status}>
                  <span>{formatStatus(status)}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="admin_finance_section">
            <div className="admin_finance_section_header">
              <div>
                <h2>Shop-wise Revenue</h2>
                <p>
                  Financial performance of each shop for the selected month.
                </p>
              </div>
            </div>

            {shops.length === 0 ? (
              <div className="admin_empty_state">
                No shop transactions found for this month.
              </div>
            ) : (
              <div className="admin_shop_finance_table_wrapper">
                <table className="admin_shop_finance_table">
                  <thead>
                    <tr>
                      <th>Shop</th>
                      <th>Owner</th>
                      <th>Total Orders</th>
                      <th>Completed</th>
                      <th>Transaction Value</th>
                      <th>Completed Revenue</th>
                      <th>RMA Fee</th>
                    </tr>
                  </thead>

                  <tbody>
                    {shops.map((shop) => (
                      <tr key={shop.shopId}>
                        <td>
                          <button
                            type="button"
                            className="admin_shop_id_button"
                            onClick={() =>
                              navigate(`/admin/shops/${shop.shopId}`)
                            }
                          >
                            <strong>{shop.shopName}</strong>
                            <span>{shop.shopId}</span>
                          </button>
                        </td>

                        <td>{shop.ownerName}</td>

                        <td>{shop.totalOrders}</td>

                        <td>{shop.completedOrders}</td>

                        <td>{formatCurrency(shop.transactionValue)}</td>

                        <td>
                          {formatCurrency(shop.completedTransactionValue)}
                        </td>

                        <td>{formatCurrency(shop.rmaFees)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminMonthlyFinance;
