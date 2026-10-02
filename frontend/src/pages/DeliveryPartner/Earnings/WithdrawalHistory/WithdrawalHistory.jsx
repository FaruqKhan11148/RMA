import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  History,
  LoaderCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './WithdrawalHistory.css';

import { fetchDeliveryWithdrawalHistory } from './utils/withdrawalHistoryApi';

function WithdrawalHistory() {
  const navigate = useNavigate();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWithdrawalHistory = async () => {
      try {
        const token = localStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const data = await fetchDeliveryWithdrawalHistory(token);

        setWithdrawals(data.withdrawals || []);
      } catch (historyError) {
        console.error('Fetch withdrawal history failed:', historyError);

        setError(historyError.message || 'Unable to load withdrawal history');
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawalHistory();
  }, []);

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWithdrawalStatus = (withdrawal) => {
    if (withdrawal.status === 'COMPLETED') {
      return {
        label: 'Completed',
        className: 'completed',
      };
    }

    if (withdrawal.status === 'FAILED') {
      return {
        label: 'Failed',
        className: 'failed',
      };
    }

    return {
      label: withdrawal.status || 'Unknown',
      className: 'unknown',
    };
  };

  return (
    <main className="delivery_withdrawal_history_page">
      <header className="delivery_withdrawal_history_header">
        <button
          type="button"
          className="delivery_withdrawal_history_back"
          onClick={() => navigate('/delivery/earnings')}
          aria-label="Back to earnings"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <span>Delivery Partner</span>
          <h1>Withdrawal History</h1>
        </div>
      </header>

      {loading ? (
        <section className="delivery_withdrawal_history_empty">
          <LoaderCircle
            className="delivery_withdrawal_history_loader"
            size={24}
          />

          <strong>Loading withdrawal history...</strong>

          <p>Please wait.</p>
        </section>
      ) : error ? (
        <section className="delivery_withdrawal_history_empty">
          <strong>{error}</strong>

          <p>Please try again later.</p>

          <button
            type="button"
            className="delivery_withdrawal_history_retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      ) : withdrawals.length === 0 ? (
        <section className="delivery_withdrawal_history_empty">
          <div className="delivery_withdrawal_history_empty_icon">
            <History size={23} />
          </div>

          <strong>No withdrawals yet</strong>

          <p>Your completed and failed withdrawal requests will appear here.</p>
        </section>
      ) : (
        <section className="delivery_withdrawal_history_section">
          <div className="delivery_withdrawal_history_section_header">
            <div>
              <h2>Previous Withdrawals</h2>

              <span>Your completed and failed withdrawal requests</span>
            </div>

            <History size={20} />
          </div>

          <div className="delivery_withdrawal_history_list">
            {withdrawals.map((withdrawal) => {
              const status = getWithdrawalStatus(withdrawal);

              const isCompleted = withdrawal.status === 'COMPLETED';

              return (
                <div
                  className="delivery_withdrawal_history_item"
                  key={withdrawal._id}
                >
                  <div className="delivery_withdrawal_history_item_left">
                    <div
                      className={`delivery_withdrawal_history_status_icon ${status.className}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}
                    </div>

                    <div>
                      <strong>{formatAmount(withdrawal.amount)}</strong>

                      <span>
                        {formatDate(
                          withdrawal.processedAt || withdrawal.createdAt,
                        )}
                        {' • '}
                        {formatTime(
                          withdrawal.processedAt || withdrawal.createdAt,
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`delivery_withdrawal_history_status ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

export default WithdrawalHistory;
