import { useEffect, useState } from 'react';

import './DeliveryPartnerAccounts.css';

import { fetchDeliveryPartnerAccounts } from '../../utils/DeliveryPartnerAccounts/deliveryPartnerAccountsApi';

function DeliveryPartnerAccounts() {
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchDeliveryPartnerAccounts();

      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Load delivery partner accounts failed:', err);

      setError(err.message || 'Failed to load delivery partner accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
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
      <section className="delivery-partner-accounts">
        <div className="delivery-partner-accounts-loading">
          Loading delivery partner accounts...
        </div>
      </section>
    );
  }

  return (
    <section className="delivery-partner-accounts">
      <div className="delivery-partner-accounts-header">
        <div>
          <h2>Delivery Partner Test Bank Accounts</h2>

          <p>Test Bank accounts created for approved delivery partners.</p>
        </div>

        <button type="button" onClick={loadAccounts} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && <div className="delivery-partner-accounts-error">{error}</div>}

      {accounts.length === 0 ? (
        <div className="delivery-partner-accounts-empty">
          No delivery partner Test Bank accounts found.
        </div>
      ) : (
        <div className="delivery-partner-accounts-table-wrapper">
          <table className="delivery-partner-accounts-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Delivery Partner</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Available</th>
                <th>Held</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {accounts.map((account) => {
                const deliveryPerson = account.deliveryPersonId;

                return (
                  <tr key={account._id}>
                    <td>
                      <strong>{account.accountNumber}</strong>
                    </td>

                    <td>
                      <div className="delivery-partner-account-person">
                        <strong>
                          {deliveryPerson?.name || 'Unlinked delivery partner'}
                        </strong>

                        {deliveryPerson?.email && (
                          <span>{deliveryPerson.email}</span>
                        )}
                      </div>
                    </td>

                    <td>{deliveryPerson?.phone || '-'}</td>

                    <td>
                      <span
                        className={`delivery-partner-account-status delivery-partner-account-status-${String(
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

export default DeliveryPartnerAccounts;
