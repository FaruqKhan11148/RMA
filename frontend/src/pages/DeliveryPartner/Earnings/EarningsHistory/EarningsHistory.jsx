import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CircleDollarSign,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './EarningsHistory.css';

import { fetchDeliveryEarningHistory } from './utils/earningsHistoryApi';

function EarningsHistory() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem('delivery_token');

        if (!token) {
          setError('Delivery partner session not found');
          setLoading(false);
          return;
        }

        const data = await fetchDeliveryEarningHistory(token);

        setTransactions(data.transactions || []);
      } catch (historyError) {
        console.error('Fetch delivery earning history failed:', historyError);

        setError(historyError.message || 'Unable to load earning history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return 'N/A';
    }

    return new Date(date).toLocaleString();
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'ORDER_DELIVERY_EARNING':
        return 'Delivery Earning';

      case 'INCENTIVE':
        return 'Incentive';

      case 'ADJUSTMENT':
        return 'Adjustment';

      case 'PENALTY':
        return 'Penalty';

      case 'REFUND_REVERSAL':
        return 'Refund Reversal';

      default:
        return 'Transaction';
    }
  };

  const isPositiveTransaction = (transaction) => {
    return ['ORDER_DELIVERY_EARNING', 'INCENTIVE', 'ADJUSTMENT'].includes(
      transaction.type,
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle2 size={18} />;

      case 'PENDING':
        return <Clock3 size={18} />;

      case 'PROCESSING':
        return <LoaderCircle size={18} />;

      case 'FAILED':
        return <XCircle size={18} />;

      case 'COMPLETED':
        return <CheckCircle2 size={18} />;

      default:
        return <CircleDollarSign size={18} />;
    }
  };

  if (loading) {
    return (
      <main className="delivery_earnings_history_page">
        <header className="delivery_earnings_history_header">
          <button
            type="button"
            className="delivery_earnings_history_back"
            onClick={() => navigate('/delivery/earnings')}
            aria-label="Back to earnings"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <span>Delivery Partner</span>
            <h1>Earnings History</h1>
          </div>
        </header>

        <section className="delivery_earnings_history_empty">
          <LoaderCircle
            className="delivery_earnings_history_loader"
            size={24}
          />

          <strong>Loading earning history...</strong>

          <p>Please wait.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="delivery_earnings_history_page">
        <header className="delivery_earnings_history_header">
          <button
            type="button"
            className="delivery_earnings_history_back"
            onClick={() => navigate('/delivery/earnings')}
            aria-label="Back to earnings"
          >
            <ArrowLeft size={21} />
          </button>

          <div>
            <span>Delivery Partner</span>
            <h1>Earnings History</h1>
          </div>
        </header>

        <section className="delivery_earnings_history_empty">
          <strong>{error}</strong>

          <p>Please try again later.</p>

          <button
            type="button"
            className="delivery_earnings_history_retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="delivery_earnings_history_page">
      <header className="delivery_earnings_history_header">
        <button
          type="button"
          className="delivery_earnings_history_back"
          onClick={() => navigate('/delivery/earnings')}
          aria-label="Back to earnings"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <span>Delivery Partner</span>
          <h1>Earnings History</h1>
        </div>
      </header>

      <section className="delivery_earnings_history_content">
        {transactions.length === 0 ? (
          <div className="delivery_earnings_history_empty">
            <CircleDollarSign size={30} />

            <strong>No earning transactions yet</strong>

            <p>
              Your delivery earnings will appear here after completing
              deliveries.
            </p>
          </div>
        ) : (
          <div className="delivery_earnings_history_list">
            {transactions.map((transaction) => {
              const positive = isPositiveTransaction(transaction);

              return (
                <article
                  key={transaction._id}
                  className="delivery_earnings_history_card"
                >
                  <div className="delivery_earnings_history_card_top">
                    <div className="delivery_earnings_history_icon">
                      <CircleDollarSign size={20} />
                    </div>

                    <div className="delivery_earnings_history_details">
                      <strong>{getTransactionTitle(transaction)}</strong>

                      {transaction.orderId && (
                        <span>Order: {transaction.orderId}</span>
                      )}

                      {transaction.description && (
                        <span>{transaction.description}</span>
                      )}

                      <small>{formatDate(transaction.createdAt)}</small>
                    </div>

                    <strong
                      className={
                        positive
                          ? 'delivery_earnings_history_amount positive'
                          : 'delivery_earnings_history_amount negative'
                      }
                    >
                      {positive ? '+' : '-'}
                      {formatAmount(transaction.amount)}
                    </strong>
                  </div>

                  <div className="delivery_earnings_history_status">
                    {getStatusIcon(transaction.status)}

                    <span>{transaction.status}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default EarningsHistory;
