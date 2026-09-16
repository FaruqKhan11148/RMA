import './AdminOwners.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOwners() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [settlements, setSettlements] = useState([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [settlementsError, setSettlementsError] = useState('');
  const [settlementActionLoading, setSettlementActionLoading] = useState(null);
  const [payuOnboardingLoading, setPayuOnboardingLoading] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/owners',
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
          throw new Error(data.message || 'Failed to fetch owners');
        }

        setOwners(data.owners || []);
      } catch (error) {
        console.error('Fetch owners error:', error);

        setError(error.message || 'Unable to load owners');
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [navigate]);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        setSettlementsLoading(true);
        setSettlementsError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/admin/owners/settlements',
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
          throw new Error(data.message || 'Failed to fetch settlements');
        }

        setSettlements(data.settlements || []);
      } catch (error) {
        console.error('Fetch settlements error:', error);

        setSettlementsError(error.message || 'Unable to load settlements');
      } finally {
        setSettlementsLoading(false);
      }
    };

    fetchSettlements();
  }, [navigate]);

  const handleSettlementAction = async (ownerId, action) => {
    try {
      setSettlementActionLoading(`${action}-${ownerId}`);

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/settlement/${action}`,
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
        throw new Error(data.message || `Failed to ${action} settlement`);
      }

      const updatedStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

      setSettlements((currentSettlements) =>
        currentSettlements.filter(
          (settlement) => settlement.ownerId !== ownerId,
        ),
      );

      setOwners((currentOwners) =>
        currentOwners.map((owner) => {
          if (owner._id !== ownerId) {
            return owner;
          }

          return {
            ...owner,
            payment: {
              ...owner.payment,
              rmaApprovalStatus: updatedStatus,
              rmaApprovedAt:
                action === 'approve' ? new Date().toISOString() : null,
              rmaRejectedAt:
                action === 'reject' ? new Date().toISOString() : null,
            },
          };
        }),
      );

      setSelectedOwner((currentOwner) => {
        if (!currentOwner || currentOwner._id !== ownerId) {
          return currentOwner;
        }

        return {
          ...currentOwner,
          payment: {
            ...currentOwner.payment,
            rmaApprovalStatus: updatedStatus,
            rmaApprovedAt:
              action === 'approve' ? new Date().toISOString() : null,
            rmaRejectedAt:
              action === 'reject' ? new Date().toISOString() : null,
          },
        };
      });
    } catch (error) {
      console.error(`Settlement ${action} error:`, error);

      setSettlementsError(error.message || `Unable to ${action} settlement`);
    } finally {
      setSettlementActionLoading(null);
    }
  };

  const handlePayUOnboarding = async (ownerId) => {
    try {
      setPayuOnboardingLoading(ownerId);

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/payu/onboarding/start`,
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
        throw new Error(data.message || 'Failed to start PayU onboarding');
      }

      setOwners((currentOwners) =>
        currentOwners.map((owner) => {
          if (owner._id !== ownerId) {
            return owner;
          }

          return {
            ...owner,
            payment: {
              ...owner.payment,
              onboardingStatus: data.onboarding?.onboardingStatus || 'PENDING',
              bankStatus: data.onboarding?.bankStatus || 'PENDING',
              kycStatus: data.onboarding?.kycStatus || 'PENDING',
              payuChildMerchantId: data.onboarding?.payuChildMerchantId || null,
              payuChildMerchantUuid:
                data.onboarding?.payuChildMerchantUuid || null,
            },
          };
        }),
      );

      setSelectedOwner((currentOwner) => {
        if (!currentOwner || currentOwner._id !== ownerId) {
          return currentOwner;
        }

        return {
          ...currentOwner,
          payment: {
            ...currentOwner.payment,
            onboardingStatus: data.onboarding?.onboardingStatus || 'PENDING',
            bankStatus: data.onboarding?.bankStatus || 'PENDING',
            kycStatus: data.onboarding?.kycStatus || 'PENDING',
            payuChildMerchantId: data.onboarding?.payuChildMerchantId || null,
            payuChildMerchantUuid:
              data.onboarding?.payuChildMerchantUuid || null,
          },
        };
      });
    } catch (error) {
      console.error('PayU onboarding error:', error);

      setSettlementsError(error.message || 'Unable to start PayU onboarding');
    } finally {
      setPayuOnboardingLoading(null);
    }
  };

  const handlePayUVerification = async (ownerId, type) => {
    try {
      setPayuOnboardingLoading(`${type}-${ownerId}`);

      let endpoint = '';

      if (type === 'bank') {
        endpoint = 'bank/verify';
      }

      if (type === 'kyc') {
        endpoint = 'kyc/verify';
      }

      if (type === 'complete') {
        endpoint = 'onboarding/complete';
      }

      const response = await fetch(
        `https://rma-backend-bo4a.onrender.com/api/admin/owners/${ownerId}/payu/${endpoint}`,
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
        throw new Error(data.message || 'PayU verification failed');
      }

      const verification = data.verification || data.onboarding;

      setOwners((currentOwners) =>
        currentOwners.map((owner) => {
          if (owner._id !== ownerId) {
            return owner;
          }

          return {
            ...owner,
            payment: {
              ...owner.payment,
              bankStatus: verification?.bankStatus || owner.payment?.bankStatus,
              kycStatus: verification?.kycStatus || owner.payment?.kycStatus,
              onboardingStatus:
                verification?.onboardingStatus ||
                owner.payment?.onboardingStatus,
              onboardedAt:
                verification?.onboardedAt || owner.payment?.onboardedAt,
            },
          };
        }),
      );

      setSelectedOwner((currentOwner) => {
        if (!currentOwner || currentOwner._id !== ownerId) {
          return currentOwner;
        }

        return {
          ...currentOwner,
          payment: {
            ...currentOwner.payment,
            bankStatus:
              verification?.bankStatus || currentOwner.payment?.bankStatus,
            kycStatus:
              verification?.kycStatus || currentOwner.payment?.kycStatus,
            onboardingStatus:
              verification?.onboardingStatus ||
              currentOwner.payment?.onboardingStatus,
            onboardedAt:
              verification?.onboardedAt || currentOwner.payment?.onboardedAt,
          },
        };
      });
    } catch (error) {
      console.error(`PayU ${type} verification error:`, error);

      setSettlementsError(error.message || 'PayU verification failed');
    } finally {
      setPayuOnboardingLoading(null);
    }
  };

  const filteredOwners = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return owners;
    }

    return owners.filter((owner) => {
      return (
        owner.shopId?.toLowerCase().includes(searchValue) ||
        owner.ownerName?.toLowerCase().includes(searchValue) ||
        owner.shopName?.toLowerCase().includes(searchValue) ||
        owner.phone?.toLowerCase().includes(searchValue) ||
        owner.email?.toLowerCase().includes(searchValue)
      );
    });
  }, [owners, search]);

  if (loading) {
    return <div className="admin-page-loading">Loading owners...</div>;
  }

  return (
    <div className="admin-owners-page">
      <div className="admin-page-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>
          <h1>Shop Owners</h1>

          <p>Manage and monitor all registered RMA shops.</p>
        </div>

        <div className="admin-owner-count">{owners.length} registered</div>
      </div>

      {error && <div className="admin-page-error">{error}</div>}

      {/* SETTLEMENT VERIFICATION */}

      <section className="admin-settlement-section">
        <div className="admin-settlement-header">
          <div>
            <span className="admin-settlement-eyebrow">
              PAYMENT VERIFICATION
            </span>

            <h2>Settlement Verification</h2>

            <p>Review owner bank details before approving settlement setup.</p>
          </div>

          <div className="admin-settlement-count">
            {settlements.length} pending
          </div>
        </div>

        {settlementsError && (
          <div className="admin-page-error">{settlementsError}</div>
        )}

        {settlementsLoading ? (
          <div className="admin-settlement-loading">
            Loading settlement requests...
          </div>
        ) : settlements.length === 0 ? (
          <div className="admin-settlement-empty">
            <strong>No pending settlement requests</strong>

            <span>
              New owner bank details will appear here after submission.
            </span>
          </div>
        ) : (
          <div className="admin-settlement-list">
            {settlements.map((settlement) => {
              const approveLoading =
                settlementActionLoading === `approve-${settlement.ownerId}`;

              const rejectLoading =
                settlementActionLoading === `reject-${settlement.ownerId}`;

              const actionLoading = approveLoading || rejectLoading;

              return (
                <div className="admin-settlement-card" key={settlement.ownerId}>
                  <div className="admin-settlement-card-header">
                    <div>
                      <span className="admin-settlement-shop-id">
                        {settlement.shopId}
                      </span>

                      <h3>{settlement.shopName}</h3>

                      <p>Owner: {settlement.ownerName}</p>
                    </div>

                    <span className="admin-settlement-status pending">
                      PENDING
                    </span>
                  </div>

                  <div className="admin-settlement-details">
                    <div>
                      <span>Account Holder</span>
                      <strong>{settlement.bank?.holderName || '—'}</strong>
                    </div>

                    <div>
                      <span>Account Number</span>
                      <strong>{settlement.bank?.accountNumber || '—'}</strong>
                    </div>

                    <div>
                      <span>IFSC</span>
                      <strong>{settlement.bank?.ifscCode || '—'}</strong>
                    </div>
                  </div>

                  <div className="admin-settlement-card-footer">
                    <span>
                      Submitted{' '}
                      {settlement.createdAt
                        ? new Date(settlement.createdAt).toLocaleString()
                        : '—'}
                    </span>

                    <div className="admin-settlement-actions">
                      <button
                        type="button"
                        className="admin-settlement-reject"
                        disabled={actionLoading}
                        onClick={() =>
                          handleSettlementAction(settlement.ownerId, 'reject')
                        }
                      >
                        {rejectLoading ? 'Rejecting...' : 'Reject'}
                      </button>

                      <button
                        type="button"
                        className="admin-settlement-approve"
                        disabled={actionLoading}
                        onClick={() =>
                          handleSettlementAction(settlement.ownerId, 'approve')
                        }
                      >
                        {approveLoading ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="admin-settlement-payu"
                        disabled={
                          actionLoading ||
                          payuOnboardingLoading === settlement.ownerId
                        }
                        onClick={() => handlePayUOnboarding(settlement.ownerId)}
                      >
                        {payuOnboardingLoading === settlement.ownerId
                          ? 'Starting...'
                          : 'Start PayU Onboarding'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="admin-owner-toolbar">
        <input
          type="text"
          placeholder="Search owner, shop or Shop ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>
          Showing {filteredOwners.length} of {owners.length}
        </span>
      </div>

      <div className="admin-owner-table-container">
        <table className="admin-owner-table">
          <thead>
            <tr>
              <th>Shop ID</th>
              <th>Owner</th>
              <th>Shop</th>
              <th>Phone</th>
              <th>Products</th>
              <th>Services</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty-state">
                  No owners found.
                </td>
              </tr>
            ) : (
              filteredOwners.map((owner) => (
                <tr key={owner._id}>
                  <td>
                    <strong>{owner.shopId || '—'}</strong>
                  </td>

                  <td>{owner.ownerName || '—'}</td>

                  <td>{owner.shopName || '—'}</td>

                  <td>{owner.phone || '—'}</td>

                  <td>{owner.products?.length || 0}</td>

                  <td>
                    <div className="admin-service-badges">
                      {owner.delivery && <span>Delivery</span>}

                      {owner.pickup && <span>Pickup</span>}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        owner.isOpen
                          ? 'owner-status open'
                          : 'owner-status closed'
                      }
                    >
                      {owner.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </td>

                  <td>
                    <button
                      className="admin-view-button"
                      onClick={() => setSelectedOwner(owner)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* OWNER DETAILS */}

      {selectedOwner && (
        <div
          className="admin-owner-overlay"
          onClick={() => setSelectedOwner(null)}
        >
          <div
            className="admin-owner-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-shop-id">
                  {selectedOwner.shopId}
                </span>

                <h2>{selectedOwner.shopName}</h2>

                <p>Owned by {selectedOwner.ownerName}</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelectedOwner(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-owner-details">
              <section>
                <h3>Owner Information</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>{selectedOwner.ownerName || '—'}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{selectedOwner.phone || '—'}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{selectedOwner.email || '—'}</strong>
                  </div>

                  <div>
                    <span>Mongo ID</span>
                    <strong>{selectedOwner._id}</strong>
                  </div>
                </div>
              </section>

              <section>
                <h3>Shop Information</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Shop ID</span>
                    <strong>{selectedOwner.shopId}</strong>
                  </div>

                  <div>
                    <span>Shop Name</span>
                    <strong>{selectedOwner.shopName || '—'}</strong>
                  </div>

                  <div className="full-width">
                    <span>Description</span>
                    <strong>{selectedOwner.description || '—'}</strong>
                  </div>

                  <div className="full-width">
                    <span>Address</span>
                    <strong>{selectedOwner.address || '—'}</strong>
                  </div>

                  <div>
                    <span>Shop Status</span>
                    <strong>{selectedOwner.isOpen ? 'Open' : 'Closed'}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>
                      {selectedOwner.delivery ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>

                  <div>
                    <span>Pickup</span>
                    <strong>
                      {selectedOwner.pickup ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                </div>
              </section>

              <section>
                <h3>Products ({selectedOwner.products?.length || 0})</h3>

                {selectedOwner.products?.length > 0 ? (
                  <div className="admin-products-list">
                    {selectedOwner.products.map((product) => (
                      <div
                        className="admin-product-row"
                        key={product.productId}
                      >
                        <div>
                          <strong>{product.name}</strong>

                          <span>
                            {product.category} · {product.unit}
                          </span>
                        </div>

                        <div className="admin-product-right">
                          <strong>₹{product.price}</strong>

                          <span
                            className={
                              product.available
                                ? 'product-available'
                                : 'product-unavailable'
                            }
                          >
                            {product.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-no-products">No products added.</p>
                )}
              </section>

              <section>
                <h3>Payment / Settlement</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>RMA Approval</span>
                    <strong>
                      {selectedOwner.payment?.rmaApprovalStatus ||
                        'NOT_STARTED'}
                    </strong>
                  </div>

                  <div>
                    <span>Bank Verification</span>
                    <strong>
                      {selectedOwner.payment?.bankStatus || 'NOT_STARTED'}
                    </strong>
                  </div>

                  <div>
                    <span>KYC Verification</span>
                    <strong>
                      {selectedOwner.payment?.kycStatus || 'NOT_STARTED'}
                    </strong>
                  </div>

                  <div>
                    <span>PayU Onboarding</span>
                    <strong>
                      {selectedOwner.payment?.onboardingStatus || 'NOT_STARTED'}
                    </strong>
                  </div>

                  <div>
                    <span>Provider</span>
                    <strong>{selectedOwner.payment?.provider || '—'}</strong>
                  </div>

                  <div>
                    <span>Child Merchant</span>
                    <strong>
                      {selectedOwner.payment?.payuChildMerchantId
                        ? 'CREATED'
                        : 'NOT_CREATED'}
                    </strong>
                  </div>

                  {selectedOwner.payment?.payuChildMerchantId && (
                    <div className="full-width">
                      <span>PayU Child Merchant ID</span>
                      <strong>
                        {selectedOwner.payment.payuChildMerchantId}
                      </strong>
                    </div>
                  )}

                  {selectedOwner.payment?.payuChildMerchantUuid && (
                    <div className="full-width">
                      <span>PayU Child Merchant UUID</span>
                      <strong>
                        {selectedOwner.payment.payuChildMerchantUuid}
                      </strong>
                    </div>
                  )}
                </div>

                <div className="admin-payu-actions">
                  {selectedOwner.payment?.rmaApprovalStatus === 'APPROVED' &&
                    selectedOwner.payment?.onboardingStatus ===
                      'NOT_STARTED' && (
                      <button
                        type="button"
                        className="admin-settlement-payu"
                        disabled={payuOnboardingLoading === selectedOwner._id}
                        onClick={() => handlePayUOnboarding(selectedOwner._id)}
                      >
                        {payuOnboardingLoading === selectedOwner._id
                          ? 'Starting PayU Onboarding...'
                          : 'Start PayU Onboarding'}
                      </button>
                    )}

                  {selectedOwner.payment?.onboardingStatus === 'PENDING' &&
                    selectedOwner.payment?.bankStatus === 'PENDING' && (
                      <button
                        type="button"
                        className="admin-settlement-payu"
                        disabled={
                          payuOnboardingLoading === `bank-${selectedOwner._id}`
                        }
                        onClick={() =>
                          handlePayUVerification(selectedOwner._id, 'bank')
                        }
                      >
                        {payuOnboardingLoading === `bank-${selectedOwner._id}`
                          ? 'Verifying Bank...'
                          : 'Verify Bank'}
                      </button>
                    )}

                  {selectedOwner.payment?.bankStatus === 'VERIFIED' &&
                    selectedOwner.payment?.kycStatus === 'PENDING' && (
                      <button
                        type="button"
                        className="admin-settlement-payu"
                        disabled={
                          payuOnboardingLoading === `kyc-${selectedOwner._id}`
                        }
                        onClick={() =>
                          handlePayUVerification(selectedOwner._id, 'kyc')
                        }
                      >
                        {payuOnboardingLoading === `kyc-${selectedOwner._id}`
                          ? 'Verifying KYC...'
                          : 'Verify KYC'}
                      </button>
                    )}

                  {selectedOwner.payment?.bankStatus === 'VERIFIED' &&
                    selectedOwner.payment?.kycStatus === 'VERIFIED' &&
                    selectedOwner.payment?.onboardingStatus === 'PENDING' && (
                      <button
                        type="button"
                        className="admin-settlement-payu"
                        disabled={
                          payuOnboardingLoading ===
                          `complete-${selectedOwner._id}`
                        }
                        onClick={() =>
                          handlePayUVerification(selectedOwner._id, 'complete')
                        }
                      >
                        {payuOnboardingLoading ===
                        `complete-${selectedOwner._id}`
                          ? 'Completing Onboarding...'
                          : 'Complete PayU Onboarding'}
                      </button>
                    )}
                </div>
              </section>

              <section>
                <h3>Account Dates</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Created</span>
                    <strong>
                      {selectedOwner.createdAt
                        ? new Date(selectedOwner.createdAt).toLocaleString()
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>
                      {selectedOwner.updatedAt
                        ? new Date(selectedOwner.updatedAt).toLocaleString()
                        : '—'}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOwners;
