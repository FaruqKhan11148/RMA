function SettlementVerification({
  settlements,
  settlementsLoading,
  settlementsError,
  settlementActionLoading,
  payuOnboardingLoading,
  onSettlementAction,
  onPayUOnboarding,
}) {
  return (
    <section className="admin-settlement-section">
      <div className="admin-settlement-header">
        <div>
          <div className="admin-settlement-eyebrow">
            Settlement Verification
          </div>

          <h2>Pending owner settlements</h2>
        </div>

        <div className="admin-settlement-count">
          {settlements.length} pending
        </div>
      </div>

      {settlementsLoading ? (
        <div className="admin-settlement-loading">Loading settlements...</div>
      ) : settlements.length === 0 ? (
        <div className="admin-settlement-empty">No pending settlements.</div>
      ) : (
        <div className="admin-settlement-list">
          {settlements.map((settlement) => (
            <div className="admin-settlement-card" key={settlement.ownerId}>
              <div className="admin-settlement-card-header">
                <div>
                  <div className="admin-settlement-shop-id">
                    {settlement.shopId}
                  </div>

                  <h3>{settlement.shopName}</h3>

                  <p>{settlement.ownerName}</p>
                </div>

                <span className="admin-settlement-status pending">PENDING</span>
              </div>

              <div className="admin-settlement-details">
                <div>
                  <strong>Account Holder</strong>
                  <span>{settlement.bank?.holderName || '—'}</span>
                </div>

                <div>
                  <strong>Account Number</strong>
                  <span>{settlement.bank?.accountNumber || '—'}</span>
                </div>

                <div>
                  <strong>IFSC Code</strong>
                  <span>{settlement.bank?.ifscCode || '—'}</span>
                </div>

                <div>
                  <strong>Submitted</strong>
                  <span>
                    {settlement.createdAt
                      ? new Date(settlement.createdAt).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="admin-settlement-card-footer">
                <div className="admin-settlement-actions">
                  <button
                    className="admin-settlement-reject"
                    onClick={() =>
                      onSettlementAction(settlement.ownerId, 'reject')
                    }
                    disabled={
                      settlementActionLoading === `reject-${settlement.ownerId}`
                    }
                  >
                    {settlementActionLoading === `reject-${settlement.ownerId}`
                      ? 'Rejecting...'
                      : 'Reject'}
                  </button>

                  <button
                    className="admin-settlement-approve"
                    onClick={() =>
                      onSettlementAction(settlement.ownerId, 'approve')
                    }
                    disabled={
                      settlementActionLoading ===
                      `approve-${settlement.ownerId}`
                    }
                  >
                    {settlementActionLoading === `approve-${settlement.ownerId}`
                      ? 'Approving...'
                      : 'Approve'}
                  </button>
                </div>

                <div className="admin-settlement-payu">
                  <button
                    className="admin-settlement-payu"
                    onClick={() => onPayUOnboarding(settlement.ownerId)}
                    disabled={payuOnboardingLoading === settlement.ownerId}
                  >
                    {payuOnboardingLoading === settlement.ownerId
                      ? 'Starting PayU...'
                      : 'Start PayU Onboarding'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {settlementsError && (
        <div className="admin-page-error">{settlementsError}</div>
      )}
    </section>
  );
}

export default SettlementVerification;
