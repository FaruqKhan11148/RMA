import './AdminDeliveryEarnings.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDeliveryEarnings() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    pendingAmount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingEarnings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-earnings/pending',
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (response.status === 401) {
        navigate('/admin/login', { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch pending delivery earnings',
        );
      }

      setTransactions(data.transactions || []);

      setStats({
        pendingCount: Number(data.stats?.pendingCount || 0),
        pendingAmount: Number(data.stats?.pendingAmount || 0),
      });
    } catch (error) {
      console.error('Admin pending delivery earnings fetch failed:', error);

      setError(error.message || 'Unable to load pending delivery earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEarnings();
  }, [navigate]);

  const handleRelease = async (transactionId) => {
    const transaction = transactions.find((item) => item._id === transactionId);

    const amount = Number(transaction?.amount || 0);
    const partnerName =
      transaction?.deliveryPersonId?.name || 'delivery partner';

    const confirmed = window.confirm(
      `Release ₹${amount.toFixed(
        2,
      )} to ${partnerName}?\n\nThis will make the earning available in the delivery partner's wallet.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(transactionId);
      setError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-earnings/${transactionId}/release`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );

      if (response.status === 401) {
        navigate('/admin/login', { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to release delivery earning');
      }

      await fetchPendingEarnings();
    } catch (error) {
      console.error('Release delivery earning failed:', error);

      setError(error.message || 'Unable to release delivery earning');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-delivery-earnings-page">
      <div className="admin-delivery-earnings-header">
        <button
          type="button"
          className="admin-delivery-earnings-back"
          onClick={() => navigate('/admin/dashboard')}
        >
          ← Back
        </button>

        <div>
          <h1>Delivery Earnings</h1>
          <p>Review and release delivery partner earnings</p>
        </div>
      </div>

      <div className="admin-delivery-earnings-stats">
        <div className="admin-delivery-earnings-stat-card">
          <span>Pending Earnings</span>
          <strong>{stats.pendingCount}</strong>
        </div>

        <div className="admin-delivery-earnings-stat-card">
          <span>Pending Amount</span>
          <strong>₹{stats.pendingAmount.toFixed(2)}</strong>
        </div>
      </div>

      {error && <div className="admin-delivery-earnings-error">{error}</div>}

      <div className="admin-delivery-earnings-content">
        {loading ? (
          <div className="admin-delivery-earnings-loading">
            Loading pending delivery earnings...
          </div>
        ) : transactions.length === 0 ? (
          <div className="admin-delivery-earnings-empty">
            <h3>No pending delivery earnings</h3>
            <p>All delivery partner earnings have been released.</p>
          </div>
        ) : (
          <div className="admin-delivery-earnings-list">
            {transactions.map((transaction) => {
              const isProcessing = processingId === transaction._id;

              return (
                <div
                  key={transaction._id}
                  className="admin-delivery-earning-card"
                >
                  <div className="admin-delivery-earning-main">
                    <div className="admin-delivery-earning-info">
                      <h3>
                        {transaction.deliveryPersonId?.name ||
                          'Unknown Partner'}
                      </h3>

                      <p>
                        Phone: {transaction.deliveryPersonId?.phone || 'N/A'}
                      </p>

                      <p>
                        Type:{' '}
                        {transaction.deliveryPersonId?.deliveryType || 'N/A'}
                      </p>

                      <p>Order: {transaction.orderId || 'N/A'}</p>

                      <p>
                        Created:{' '}
                        {transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="admin-delivery-earning-amount">
                      <span>Delivery Earning</span>
                      <strong>
                        ₹{Number(transaction.amount || 0).toFixed(2)}
                      </strong>
                      <small>{transaction.status}</small>
                    </div>
                  </div>

                  <div className="admin-delivery-earning-actions">
                    <button
                      type="button"
                      className="admin-delivery-earning-release"
                      onClick={() => handleRelease(transaction._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Releasing...' : 'Release Earning'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDeliveryEarnings;
