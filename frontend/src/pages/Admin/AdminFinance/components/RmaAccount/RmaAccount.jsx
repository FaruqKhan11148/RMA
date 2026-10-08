import { useEffect, useState } from 'react';

import './RmaAccount.css';

import {
  fetchRmaAccount,
  setupRmaAccount,
} from '../../utils/RmaAccount/rmaAccountApi';

function RmaAccount() {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRmaAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchRmaAccount();

      setAccount(data.account || null);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Load RMA account failed:', err);

      setError(err.message || 'Failed to load RMA account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRmaAccount();
  }, []);

  const handleSetup = async () => {
    try {
      setSetupLoading(true);
      setError('');

      const data = await setupRmaAccount();

      setAccount(data.account || null);

      await loadRmaAccount();
    } catch (err) {
      console.error('Setup RMA account failed:', err);

      setError(err.message || 'Failed to setup RMA account');
    } finally {
      setSetupLoading(false);
    }
  };

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <section className="rma-account">
        <div className="rma-account-loading">Loading RMA account...</div>
      </section>
    );
  }

  return (
    <section className="rma-account">
      <div className="rma-account-header">
        <div>
          <h2>RMA Test Bank Account</h2>

          <p>Central RMA account used for platform financial settlements.</p>
        </div>

        {!account && (
          <button type="button" onClick={handleSetup} disabled={setupLoading}>
            {setupLoading ? 'Setting up...' : 'Setup RMA Account'}
          </button>
        )}
      </div>

      {error && <div className="rma-account-error">{error}</div>}

      {!account ? (
        <div className="rma-account-empty">
          <h3>RMA account not found</h3>

          <p>Create the fixed RMA Test Bank account to continue.</p>

          <button type="button" onClick={handleSetup} disabled={setupLoading}>
            {setupLoading ? 'Setting up...' : 'Create RMA Account'}
          </button>
        </div>
      ) : (
        <>
          <div className="rma-account-details">
            <div className="rma-account-detail-card">
              <span>Account Number</span>
              <strong>{account.accountNumber}</strong>
            </div>

            <div className="rma-account-detail-card">
              <span>Account Name</span>
              <strong>{account.accountName}</strong>
            </div>

            <div className="rma-account-detail-card">
              <span>Status</span>
              <strong>{account.status}</strong>
            </div>

            <div className="rma-account-detail-card">
              <span>Currency</span>
              <strong>{account.currency}</strong>
            </div>
          </div>

          <div className="rma-account-balances">
            <div className="rma-account-balance-card">
              <span>Total Balance</span>
              <strong>{formatAmount(account.balance)}</strong>
            </div>

            <div className="rma-account-balance-card">
              <span>Available Balance</span>
              <strong>{formatAmount(account.availableBalance)}</strong>
            </div>

            <div className="rma-account-balance-card">
              <span>Held Balance</span>
              <strong>{formatAmount(account.heldBalance)}</strong>
            </div>
          </div>

          <div className="rma-account-transactions">
            <div className="rma-account-transactions-header">
              <div>
                <h3>Recent Transactions</h3>

                <p>Latest transactions involving the RMA Test Bank account.</p>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="rma-account-empty">
                No RMA transactions found.
              </div>
            ) : (
              <div className="rma-account-table-wrapper">
                <table className="rma-account-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{transaction.transactionId}</td>

                        <td>{transaction.transactionType}</td>

                        <td>
                          <strong>{formatAmount(transaction.amount)}</strong>
                        </td>

                        <td>{transaction.status}</td>

                        <td>{transaction.description || '-'}</td>

                        <td>{formatDate(transaction.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default RmaAccount;
