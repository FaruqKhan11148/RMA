import { useCallback, useEffect, useState } from 'react';
import {
  fetchRefundRequests,
  updateRefundStatus,
} from '../../utils/Finance/refundApi';

const FILTERS = [
  'ALL',
  'REQUESTED',
  'UNDER_REVIEW',
  'APPROVED',
  'MARKED_SENT',
  'VERIFIED',
  'FAILED',
  'REJECTED',
  'CANCELLED',
];

const ACTIONS = {
  REQUESTED: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['CANCELLED'],
  MARKED_SENT: ['VERIFIED', 'FAILED'],
  FAILED: ['UNDER_REVIEW'],
};

const LABELS = {
  UNDER_REVIEW: 'Move to review',
  APPROVED: 'Approve refund',
  REJECTED: 'Reject refund',
  VERIFIED: 'Verify transfer',
  FAILED: 'Mark transfer failed',
  CANCELLED: 'Cancel refund',
};

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function dateTime(value) {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN');
}

function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [adminReason, setAdminReason] = useState('');

  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchRefundRequests();
      setRefunds(data);
    } catch (err) {
      setError(err.message || 'Unable to load refund requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

  const filteredRefunds = refunds.filter((refund) => {
    const matchesStatus = filter === 'ALL' || refund.status === filter;

    const order = refund.order || {};
    const owner = order.ownerId || {};

    const searchableText = [
      refund.orderId,
      order.orderId,
      owner.shopName,
      owner.ownerName,
      owner.phone,
      refund.reason,
      refund.refundReference,
      refund.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      matchesStatus && searchableText.includes(search.trim().toLowerCase())
    );
  });

  async function handleStatusUpdate(refund, status) {
    if (status === 'VERIFIED') {
      const hasReference = Boolean(refund.refundReference?.trim());
      const hasEvidence = Boolean(refund.refundEvidenceUrl?.trim());

      if (!hasReference || !hasEvidence) {
        setError(
          'This refund has no transfer reference or evidence URL. Do not verify it until the transfer details are available and independently checked.',
        );
        return;
      }
    }

    if (!adminReason.trim()) {
      setError('Enter an admin note before updating the refund.');
      return;
    }

    const confirmation =
      status === 'VERIFIED'
        ? 'Have you independently confirmed that the refund reached the customer?'
        : `Update refund status to ${status.replaceAll('_', ' ')}?`;

    if (!window.confirm(confirmation)) return;

    try {
      setSavingId(String(refund._id));
      setError('');

      await updateRefundStatus(refund._id, {
        status,
        reason: adminReason.trim(),
      });

      setSelectedRefund(null);
      setAdminReason('');
      await loadRefunds();
    } catch (err) {
      setError(err.message || 'Failed to update refund status.');
    } finally {
      setSavingId('');
    }
  }

  return (
    <section className="finance-section admin-refunds">
      <div className="finance-section-header">
        <div>
          <h2>Refund Management</h2>
          <p>Review and independently verify direct UPI refunds.</p>
        </div>

        <button
          type="button"
          className="finance-view-button"
          onClick={loadRefunds}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="finance-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      <div className="admin-refund-controls">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order, shop, phone or UPI reference"
          aria-label="Search refunds"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter refund status"
        >
          {FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === 'ALL' ? 'All statuses' : status.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="finance-loading">Loading refund requests...</div>
      ) : filteredRefunds.length === 0 ? (
        <div className="finance-empty">No refund requests found.</div>
      ) : (
        <div className="finance-table-wrapper">
          <table className="finance-table admin-refund-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Shop</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredRefunds.map((refund) => {
                const order = refund.order || {};
                const owner = order.ownerId || {};

                return (
                  <tr key={refund._id}>
                    <td>{order.orderId || refund.orderId || '—'}</td>
                    <td>
                      <strong>{owner.shopName || 'Unknown shop'}</strong>
                      <small>{owner.ownerName || ''}</small>
                      <small>{owner.phone || ''}</small>
                    </td>
                    <td>{money(refund.amount)}</td>
                    <td>{refund.reason || '—'}</td>
                    <td>
                      <span
                        className={`admin-refund-status status-${String(
                          refund.status || '',
                        ).toLowerCase()}`}
                      >
                        {refund.status?.replaceAll('_', ' ') || 'UNKNOWN'}
                      </span>
                    </td>
                    <td>{dateTime(refund.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="finance-view-button"
                        onClick={() => {
                          setSelectedRefund(refund);
                          setAdminReason('');
                          setError('');
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedRefund && (
        <div
          className="finance-modal-overlay"
          onClick={() => setSelectedRefund(null)}
        >
          <div
            className="finance-modal admin-refund-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-refund-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="finance-modal-header">
              <h2 id="admin-refund-title">Refund Review</h2>
              <button
                type="button"
                onClick={() => setSelectedRefund(null)}
                aria-label="Close refund review"
              >
                ×
              </button>
            </div>

            <div className="finance-modal-content">
              <dl className="admin-refund-details">
                <dt>Order ID</dt>
                <dd>
                  {selectedRefund.order?.orderId ||
                    selectedRefund.orderId ||
                    '—'}
                </dd>

                <dt>Refund amount</dt>
                <dd>{money(selectedRefund.amount)}</dd>

                <dt>Refund status</dt>
                <dd>{selectedRefund.status}</dd>

                <dt>Customer reason</dt>
                <dd>{selectedRefund.reason || '—'}</dd>

                <dt>Shop</dt>
                <dd>{selectedRefund.order?.ownerId?.shopName || '—'}</dd>

                <dt>Owner</dt>
                <dd>{selectedRefund.order?.ownerId?.ownerName || '—'}</dd>

                <dt>Owner phone</dt>
                <dd>{selectedRefund.order?.ownerId?.phone || '—'}</dd>

                <dt>UPI transaction reference</dt>
                <dd>{selectedRefund.refundReference || 'Not provided'}</dd>

                <dt>Transfer reported at</dt>
                <dd>{dateTime(selectedRefund.refundSentAt)}</dd>

                <dt>Transfer evidence</dt>
                <dd>
                  {selectedRefund.refundEvidenceUrl ? (
                    <a
                      href={selectedRefund.refundEvidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open transfer evidence
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </dd>

                <dt>Created</dt>
                <dd>{dateTime(selectedRefund.createdAt)}</dd>
              </dl>

              {selectedRefund.status === 'MARKED_SENT' && (
                <p className="admin-refund-warning">
                  The owner reports that the transfer was sent. This is not
                  proof that the customer received it. Check the transaction
                  independently before verifying.
                </p>
              )}

              <label htmlFor="admin-refund-reason">
                Admin review note (required)
              </label>

              <textarea
                id="admin-refund-reason"
                value={adminReason}
                onChange={(event) => setAdminReason(event.target.value)}
                placeholder="Record your review decision and verification details"
                rows={3}
              />
            </div>

            <div className="finance-modal-footer admin-refund-actions">
              {(ACTIONS[selectedRefund.status] || []).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    status === 'REJECTED' || status === 'FAILED'
                      ? 'admin-refund-action danger'
                      : 'admin-refund-action'
                  }
                  disabled={savingId === String(selectedRefund._id)}
                  onClick={() => handleStatusUpdate(selectedRefund, status)}
                >
                  {savingId === String(selectedRefund._id)
                    ? 'Saving...'
                    : LABELS[status] || status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminRefunds;
