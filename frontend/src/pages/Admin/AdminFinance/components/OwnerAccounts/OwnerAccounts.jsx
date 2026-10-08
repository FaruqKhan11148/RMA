import { useEffect, useState } from 'react';

import './OwnerAccounts.css';

import { fetchOwnerAccounts } from '../../utils/OwnerAccounts/ownerAccountsApi';

function OwnerAccounts() {
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOwnerAccounts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchOwnerAccounts();

      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Load owner accounts failed:', err);

      setError(err.message || 'Failed to load owner accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerAccounts();
  }, []);

  const formatAmount = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <section className="owner-accounts">
        <div className="owner-accounts-loading">Loading owner accounts...</div>
      </section>
    );
  }

  return (
    <section className="owner-accounts">
      <div className="owner-accounts-header">
        <div>
          <h2>Owner Test Bank Accounts</h2>

          <p>Test Bank accounts created for approved shop owners.</p>
        </div>

        <button type="button" onClick={loadOwnerAccounts} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="owner-accounts-error">{error}</div>}

      {accounts.length === 0 ? (
        <div className="owner-accounts-empty">
          No owner Test Bank accounts found.
        </div>
      ) : (
        <div className="owner-accounts-table-wrapper">
          <table className="owner-accounts-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Owner</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Available</th>
                <th>Held</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((account) => {
                const owner = account.ownerId;

                return (
                  <tr key={account._id}>
                    <td>
                      <strong>{account.accountNumber}</strong>
                    </td>

                    <td>
                      <div className="owner-account-person">
                        <strong>{owner?.name || 'Unlinked owner'}</strong>

                        {owner?.phone && <span>{owner.phone}</span>}
                      </div>
                    </td>

                    <td>{owner?.shopName || '-'}</td>

                    <td>
                      <span
                        className={`owner-account-status owner-account-status-${String(
                          account.status || '',
                        ).toLowerCase()}`}
                      >
                        {account.status}
                      </span>
                    </td>

                    <td>
                      <strong>{formatAmount(account.balance)}</strong>
                    </td>

                    <td>{formatAmount(account.availableBalance)}</td>

                    <td>{formatAmount(account.heldBalance)}</td>

                    <td>{formatDate(account.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OwnerAccounts;
