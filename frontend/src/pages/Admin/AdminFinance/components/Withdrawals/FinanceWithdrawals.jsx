import './FinanceWithdrawals.css';

import { useEffect, useState } from 'react';

import {
  fetchFinanceWithdrawals,
  completeFinanceWithdrawal,
  rejectFinanceWithdrawal,
} from '../../utils/Withdrawals/withdrawalsApi';

function FinanceWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchFinanceWithdrawals({
        status,
        page: pagination.page,
        limit: pagination.limit,
      });

      setWithdrawals(data.withdrawals || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      );
    } catch (err) {
      console.error('Load finance withdrawals failed:', err);
      setError(err.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [status, pagination.page, pagination.limit]);

  const handleComplete = async (transactionId) => {
    const confirmed = window.confirm(
      'Complete this withdrawal? The amount will be deducted from the delivery partner Test Bank account.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(transactionId);
      setError('');

      await completeFinanceWithdrawal(transactionId);

      await loadWithdrawals();
    } catch (err) {
      console.error('Complete finance withdrawal failed:', err);

      setError(err.message || 'Failed to complete withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (transactionId) => {
    const confirmed = window.confirm('Reject this withdrawal request?');

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(transactionId);
      setError('');

      await rejectFinanceWithdrawal(transactionId);

      await loadWithdrawals();
    } catch (err) {
      console.error('Reject finance withdrawal failed:', err);

      setError(err.message || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN');
  };

  return (
    <section className="finance-withdrawals">
      <div className="finance-withdrawals-header">
        <div>
          <h2>Delivery Partner Withdrawals</h2>
          <p>Review and process delivery partner withdrawal requests.</p>
        </div>

        <select
          value={status}
          onChange={(event) => {
            setPagination((current) => ({
              ...current,
              page: 1,
            }));

            setStatus(event.target.value);
          }}
        >
          <option value="">All statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && <div className="finance-withdrawals-error">{error}</div>}

      {loading ? (
        <div className="finance-withdrawals-loading">
          Loading withdrawals...
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="finance-withdrawals-empty">
          No withdrawal requests found.
        </div>
      ) : (
        <div className="finance-withdrawals-table-wrapper">
          <table className="finance-withdrawals-table">
            <thead>
              <tr>
                <th>Delivery Partner</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Processed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((withdrawal) => {
                const deliveryPerson = withdrawal.deliveryPersonId;

                const isProcessing = withdrawal.status === 'PROCESSING';

                const isActionLoading = actionLoading === withdrawal._id;

                return (
                  <tr key={withdrawal._id}>
                    <td>
                      <div>
                        <strong>
                          {deliveryPerson?.name || 'Unknown delivery partner'}
                        </strong>

                        {deliveryPerson?.phone && (
                          <div>{deliveryPerson.phone}</div>
                        )}
                      </div>
                    </td>

                    <td>
                      <strong>{formatAmount(withdrawal.amount)}</strong>
                    </td>

                    <td>
                      <span
                        className={`finance-withdrawal-status finance-withdrawal-status-${String(
                          withdrawal.status || '',
                        ).toLowerCase()}`}
                      >
                        {withdrawal.status}
                      </span>
                    </td>

                    <td>{formatDate(withdrawal.createdAt)}</td>

                    <td>{formatDate(withdrawal.processedAt)}</td>

                    <td>
                      {isProcessing ? (
                        <div className="finance-withdrawal-actions">
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleComplete(withdrawal._id)}
                          >
                            {isActionLoading ? 'Processing...' : 'Complete'}
                          </button>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleReject(withdrawal._id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="finance-withdrawals-pagination">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() =>
            setPagination((current) => ({
              ...current,
              page: current.page - 1,
            }))
          }
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>

        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() =>
            setPagination((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default FinanceWithdrawals;
