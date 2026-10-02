import './AdminDeliveryWithdrawals.css';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDeliveryWithdrawals() {
  const navigate = useNavigate();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('ALL');

  const pendingCount = withdrawals.length;

  const pendingAmount = withdrawals.reduce(
    (total, withdrawal) => total + Number(withdrawal.amount || 0),
    0,
  );

  const completedWithdrawals = history.filter(
    (withdrawal) => withdrawal.status === 'COMPLETED',
  );

  const failedWithdrawals = history.filter(
    (withdrawal) => withdrawal.status === 'FAILED',
  );

  const completedAmount = completedWithdrawals.reduce(
    (total, withdrawal) => total + Number(withdrawal.amount || 0),
    0,
  );

  const failedAmount = failedWithdrawals.reduce(
    (total, withdrawal) => total + Number(withdrawal.amount || 0),
    0,
  );

  const filteredHistory = history.filter((withdrawal) => {
    const searchValue = historySearch.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      withdrawal.deliveryPersonId?.name?.toLowerCase().includes(searchValue) ||
      withdrawal.deliveryPersonId?.phone?.toLowerCase().includes(searchValue);

    const matchesStatus =
      historyStatus === 'ALL' || withdrawal.status === historyStatus;

    return matchesSearch && matchesStatus;
  });

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-withdrawals',
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
        throw new Error(data.message || 'Failed to fetch delivery withdrawals');
      }

      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Admin delivery withdrawals fetch failed:', error);

      setError(error.message || 'Unable to load delivery withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(
        'https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-withdrawals/history',
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
        throw new Error(data.message || 'Failed to fetch withdrawal history');
      }

      setHistory(data.withdrawals || []);
    } catch (error) {
      console.error('Admin delivery withdrawal history fetch failed:', error);

      setError(error.message || 'Unable to load withdrawal history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchWithdrawalHistory();
  }, [navigate]);

  const handleComplete = async (withdrawalId) => {
    const confirmed = window.confirm(
      'Are you sure you want to complete this withdrawal?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(withdrawalId);
      setError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-withdrawals/${withdrawalId}/complete`,
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
        throw new Error(data.message || 'Failed to complete withdrawal');
      }

      await Promise.all([fetchWithdrawals(), fetchWithdrawalHistory()]);
    } catch (error) {
      console.error('Complete withdrawal failed:', error);

      setError(error.message || 'Unable to complete withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    const confirmed = window.confirm(
      'Are you sure you want to reject this withdrawal?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(withdrawalId);
      setError('');

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/orders/delivery-withdrawals/${withdrawalId}/reject`,
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
        throw new Error(data.message || 'Failed to reject withdrawal');
      }

      await Promise.all([fetchWithdrawals(), fetchWithdrawalHistory()]);
    } catch (error) {
      console.error('Reject withdrawal failed:', error);

      setError(error.message || 'Unable to reject withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="admin-delivery-withdrawals-page">
      <div className="admin-delivery-withdrawals-header">
        <button
          type="button"
          className="admin-delivery-withdrawals-back"
          onClick={() => navigate('/admin/dashboard')}
        >
          ← Back
        </button>

        <div>
          <h1>Delivery Withdrawals</h1>
          <p>Manage delivery partner withdrawal requests</p>
        </div>
      </div>

      <div className="admin-delivery-withdrawals-stats">
        <div className="admin-delivery-withdrawals-stat-card">
          <span>Pending Requests</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="admin-delivery-withdrawals-stat-card">
          <span>Pending Amount</span>
          <strong>₹{pendingAmount.toFixed(2)}</strong>
        </div>

        <div className="admin-delivery-withdrawals-stat-card">
          <span>Completed Withdrawals</span>
          <strong>{completedWithdrawals.length}</strong>
        </div>

        <div className="admin-delivery-withdrawals-stat-card">
          <span>Completed Amount</span>
          <strong>₹{completedAmount.toFixed(2)}</strong>
        </div>

        <div className="admin-delivery-withdrawals-stat-card">
          <span>Failed Withdrawals</span>
          <strong>{failedWithdrawals.length}</strong>
        </div>

        <div className="admin-delivery-withdrawals-stat-card">
          <span>Failed Amount</span>
          <strong>₹{failedAmount.toFixed(2)}</strong>
        </div>
      </div>

      {error && <div className="admin-delivery-withdrawals-error">{error}</div>}

      <div className="admin-delivery-withdrawals-content">
        {loading ? (
          <div className="admin-delivery-withdrawals-loading">
            Loading withdrawal requests...
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="admin-delivery-withdrawals-empty">
            No pending withdrawal requests.
          </div>
        ) : (
          <div className="admin-delivery-withdrawals-list">
            {withdrawals.map((withdrawal) => {
              const isProcessing = processingId === withdrawal._id;

              const bankAccount = withdrawal.deliveryPersonId?.bankAccount;

              const accountNumber = bankAccount?.accountNumber || '';

              const maskedAccountNumber = accountNumber
                ? `XXXX XXXX ${accountNumber.slice(-4)}`
                : 'Not available';

              return (
                <div
                  key={withdrawal._id}
                  className="admin-delivery-withdrawal-card"
                >
                  <div className="admin-delivery-withdrawal-info">
                    <h3>
                      {withdrawal.deliveryPersonId?.name || 'Unknown Partner'}
                    </h3>

                    <p>Phone: {withdrawal.deliveryPersonId?.phone || 'N/A'}</p>

                    <p>Amount: ₹{Number(withdrawal.amount || 0).toFixed(2)}</p>

                    <p>Status: {withdrawal.status}</p>

                    <p>
                      Requested:{' '}
                      {withdrawal.createdAt
                        ? new Date(withdrawal.createdAt).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="admin-delivery-withdrawal-bank">
                    <h4>Bank Details</h4>

                    <div className="admin-delivery-withdrawal-bank-grid">
                      <div>
                        <span>Account Holder</span>
                        <strong>
                          {bankAccount?.accountHolderName || 'N/A'}
                        </strong>
                      </div>

                      <div>
                        <span>Bank</span>
                        <strong>{bankAccount?.bankName || 'N/A'}</strong>
                      </div>

                      <div>
                        <span>Account Number</span>
                        <strong>{maskedAccountNumber}</strong>
                      </div>

                      <div>
                        <span>IFSC</span>
                        <strong>{bankAccount?.ifsc || 'N/A'}</strong>
                      </div>

                      <div>
                        <span>Bank Verification</span>
                        <strong
                          className={
                            bankAccount?.status === 'VERIFIED'
                              ? 'admin-delivery-withdrawal-bank-verified'
                              : 'admin-delivery-withdrawal-bank-unverified'
                          }
                        >
                          {bankAccount?.status || 'NOT_SUBMITTED'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="admin-delivery-withdrawal-actions">
                    <button
                      type="button"
                      className="admin-delivery-withdrawal-complete"
                      onClick={() => handleComplete(withdrawal._id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Approve & Complete'}
                    </button>

                    <button
                      type="button"
                      className="admin-delivery-withdrawal-reject"
                      onClick={() => handleReject(withdrawal._id)}
                      disabled={isProcessing}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="admin-delivery-withdrawals-history">
        <div className="admin-delivery-withdrawals-history-header">
          <h2>Withdrawal History</h2>
          <p>Completed and rejected withdrawal requests</p>
        </div>

        <div className="admin-delivery-withdrawals-filters">
          <input
            type="text"
            value={historySearch}
            onChange={(event) => setHistorySearch(event.target.value)}
            placeholder="Search partner or phone"
          />

          <select
            value={historyStatus}
            onChange={(event) => setHistoryStatus(event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {historyLoading ? (
          <div className="admin-delivery-withdrawals-loading">
            Loading withdrawal history...
          </div>
        ) : history.length === 0 ? (
          <div className="admin-delivery-withdrawals-empty">
            No withdrawal history yet.
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="admin-delivery-withdrawals-empty">
            No withdrawals match your filters.
          </div>
        ) : (
          <div className="admin-delivery-withdrawals-list">
            {filteredHistory.map((withdrawal) => (
              <div
                key={withdrawal._id}
                className="admin-delivery-withdrawal-card"
              >
                <div className="admin-delivery-withdrawal-info">
                  <h3>
                    {withdrawal.deliveryPersonId?.name || 'Unknown Partner'}
                  </h3>

                  <p>Phone: {withdrawal.deliveryPersonId?.phone || 'N/A'}</p>

                  <p>Amount: ₹{Number(withdrawal.amount || 0).toFixed(2)}</p>

                  <p>Status: {withdrawal.status}</p>

                  <p>
                    {withdrawal.status === 'COMPLETED'
                      ? 'Completed'
                      : 'Rejected'}
                    :{' '}
                    {withdrawal.processedAt
                      ? new Date(withdrawal.processedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDeliveryWithdrawals;
