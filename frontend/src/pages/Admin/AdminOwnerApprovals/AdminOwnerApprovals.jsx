import { useCallback, useEffect, useState } from 'react';
import './AdminOwnerApprovals.css';

import PendingOwnerCard from './components/PendingOwnerCard';
import OwnerApprovalDetails from './components/OwnerApprovalDetails';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function AdminOwnerApprovals() {
  const [registrations, setRegistrations] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}api/admin/owners/registrations/pending`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load pending shop registrations.',
        );
      }

      const items = Array.isArray(data.registrations) ? data.registrations : [];

      setRegistrations(items);

      setSelectedOwner((current) => {
        if (!current) return null;

        return (
          items.find((item) => String(item._id) === String(current._id)) || null
        );
      });
    } catch (err) {
      setError(
        err.message || 'Something went wrong while loading registrations.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRegistrations();
  }, [fetchPendingRegistrations]);

  const handleRegistrationAction = async (ownerId, action, reason = '') => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `${API_URL}api/admin/owners/${encodeURIComponent(ownerId)}/registration/${action}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body:
            action === 'reject'
              ? JSON.stringify({ reason: reason.trim() })
              : undefined,
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${action} this shop registration.`,
        );
      }

      setRegistrations((current) =>
        current.filter((owner) => String(owner._id) !== String(ownerId)),
      );

      setSelectedOwner(null);

      setSuccess(
        action === 'approve'
          ? 'Shop registration approved successfully.'
          : 'Shop registration rejected successfully.',
      );
    } catch (err) {
      setError(err.message || 'The action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="admin_owner_approvals">
      <header className="admin_owner_approvals__header">
        <div>
          <p className="admin_owner_approvals__eyebrow">SHOP MANAGEMENT</p>

          <h1>Shop Approvals</h1>

          <p className="admin_owner_approvals__subtitle">
            Review new shop registrations before allowing them to operate on
            RMA.
          </p>
        </div>

        <button
          type="button"
          className="admin_owner_approvals__refresh"
          onClick={fetchPendingRegistrations}
          disabled={loading || actionLoading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="admin_owner_approvals__summary">
        <div>
          <span className="admin_owner_approvals__summary-label">
            Pending registrations
          </span>

          <strong>{registrations.length}</strong>
        </div>

        <p>
          Only approve a shop after reviewing its owner and registration
          details.
        </p>
      </section>

      {success && (
        <div
          className="admin_owner_approvals__alert admin_owner_approvals__alert--success"
          role="status"
        >
          <span>{success}</span>

          <button type="button" onClick={() => setSuccess('')}>
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          className="admin_owner_approvals__alert admin_owner_approvals__alert--error"
          role="alert"
        >
          <span>{error}</span>

          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="admin_owner_approvals__loading" aria-live="polite">
          <span className="admin_owner_approvals__spinner" />
          <p>Loading shop registrations...</p>
        </div>
      ) : registrations.length === 0 ? (
        <section className="admin_owner_approvals__empty">
          <div className="admin_owner_approvals__empty-icon">✓</div>

          <h2>You're all caught up</h2>

          <p>There are no pending shop registrations to review right now.</p>

          <button
            type="button"
            className="admin_owner_approvals__primary-button"
            onClick={fetchPendingRegistrations}
          >
            Check again
          </button>
        </section>
      ) : (
        <section className="admin_owner_approvals__list">
          <div className="admin_owner_approvals__list-heading">
            <h2>Awaiting review</h2>

            <span>
              {registrations.length}{' '}
              {registrations.length === 1 ? 'shop' : 'shops'}
            </span>
          </div>

          {registrations.map((owner) => (
            <PendingOwnerCard
              key={owner._id}
              owner={owner}
              onViewDetails={() => setSelectedOwner(owner)}
            />
          ))}
        </section>
      )}

      {selectedOwner && (
        <OwnerApprovalDetails
          owner={selectedOwner}
          loading={actionLoading}
          onClose={() => {
            if (!actionLoading) setSelectedOwner(null);
          }}
          onApprove={() =>
            handleRegistrationAction(selectedOwner._id, 'approve')
          }
          onReject={(reason) =>
            handleRegistrationAction(selectedOwner._id, 'reject', reason)
          }
        />
      )}
    </main>
  );
}

export default AdminOwnerApprovals;
