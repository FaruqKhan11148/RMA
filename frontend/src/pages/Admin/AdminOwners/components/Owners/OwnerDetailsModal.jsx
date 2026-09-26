function OwnerDetailsModal({
  selectedOwner,
  onClose,
  onPayUOnboarding,
  onPayUVerification,
  payuOnboardingLoading,
  payuVerificationLoading,
}) {
  if (!selectedOwner) {
    return null;
  }

  const payment = selectedOwner.payment;

  return (
    <div className="admin-owner-overlay" onClick={onClose}>
      <div className="admin-owner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <div className="admin-modal-shop-id">{selectedOwner.shopId}</div>

            <h2>{selectedOwner.shopName}</h2>
          </div>

          <button className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-owner-details">
          <section>
            <h3>Owner Information</h3>

            <div className="admin-detail-grid">
              <div>
                <strong>Owner Name</strong>
                <span>{selectedOwner.ownerName}</span>
              </div>

              <div>
                <strong>Phone</strong>
                <span>{selectedOwner.phone}</span>
              </div>

              <div>
                <strong>Email</strong>
                <span>{selectedOwner.email}</span>
              </div>

              <div>
                <strong>Owner ID</strong>
                <span>{selectedOwner._id}</span>
              </div>
            </div>
          </section>

          <section>
            <h3>Shop Information</h3>

            <div className="admin-detail-grid">
              <div>
                <strong>Shop ID</strong>
                <span>{selectedOwner.shopId}</span>
              </div>

              <div>
                <strong>Shop Name</strong>
                <span>{selectedOwner.shopName}</span>
              </div>

              <div className="full-width">
                <strong>Description</strong>
                <span>{selectedOwner.description || '—'}</span>
              </div>

              <div className="full-width">
                <strong>Address</strong>
                <span>{selectedOwner.address || '—'}</span>
              </div>

              <div>
                <strong>Status</strong>
                <span>{selectedOwner.isOpen ? 'Open' : 'Closed'}</span>
              </div>

              <div>
                <strong>Delivery</strong>
                <span>
                  {selectedOwner.delivery ? 'Available' : 'Not Available'}
                </span>
              </div>

              <div>
                <strong>Pickup</strong>
                <span>
                  {selectedOwner.pickup ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3>Products</h3>

            {selectedOwner.products?.length ? (
              <div className="admin-products-list">
                {selectedOwner.products.map((product) => (
                  <div className="admin-product-row" key={product.productId}>
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
              <div className="admin-no-products">No products added.</div>
            )}
          </section>

          <section>
            <h3>Payment / Settlement</h3>

            <div className="admin-detail-grid">
              <div>
                <strong>RMA Approval</strong>
                <span>{payment?.rmaApprovalStatus || 'NOT_STARTED'}</span>
              </div>

              <div>
                <strong>Bank Verification</strong>
                <span>{payment?.bankStatus || 'PENDING'}</span>
              </div>

              <div>
                <strong>KYC Verification</strong>
                <span>{payment?.kycStatus || 'PENDING'}</span>
              </div>

              <div>
                <strong>PayU Onboarding</strong>
                <span>{payment?.onboardingStatus || 'PENDING'}</span>
              </div>

              <div>
                <strong>Provider</strong>
                <span>{payment?.provider || '—'}</span>
              </div>

              <div>
                <strong>Child Merchant</strong>
                <span>{payment?.payuChildMerchantId || '—'}</span>
              </div>

              {payment?.payuChildMerchantId && (
                <div>
                  <strong>PayU Child Merchant ID</strong>
                  <span>{payment.payuChildMerchantId}</span>
                </div>
              )}

              {payment?.payuChildMerchantUuid && (
                <div>
                  <strong>PayU Child Merchant UUID</strong>
                  <span>{payment.payuChildMerchantUuid}</span>
                </div>
              )}
            </div>

            <div className="admin-payu-actions">
              {payment?.rmaApprovalStatus === 'APPROVED' &&
                payment?.onboardingStatus === 'NOT_STARTED' && (
                  <button
                    onClick={() => onPayUOnboarding(selectedOwner._id)}
                    disabled={payuOnboardingLoading === selectedOwner._id}
                  >
                    {payuOnboardingLoading === selectedOwner._id
                      ? 'Starting PayU...'
                      : 'Start PayU Onboarding'}
                  </button>
                )}

              {payment?.onboardingStatus === 'PENDING' &&
                payment?.bankStatus === 'PENDING' && (
                  <button
                    onClick={() =>
                      onPayUVerification(selectedOwner._id, 'bank')
                    }
                    disabled={
                      payuVerificationLoading === `bank-${selectedOwner._id}`
                    }
                  >
                    {payuVerificationLoading === `bank-${selectedOwner._id}`
                      ? 'Verifying Bank...'
                      : 'Verify Bank'}
                  </button>
                )}

              {payment?.bankStatus === 'VERIFIED' &&
                payment?.kycStatus === 'PENDING' && (
                  <button
                    onClick={() => onPayUVerification(selectedOwner._id, 'kyc')}
                    disabled={
                      payuVerificationLoading === `kyc-${selectedOwner._id}`
                    }
                  >
                    {payuVerificationLoading === `kyc-${selectedOwner._id}`
                      ? 'Verifying KYC...'
                      : 'Verify KYC'}
                  </button>
                )}

              {payment?.bankStatus === 'VERIFIED' &&
                payment?.kycStatus === 'VERIFIED' &&
                payment?.onboardingStatus === 'PENDING' && (
                  <button
                    onClick={() =>
                      onPayUVerification(selectedOwner._id, 'complete')
                    }
                    disabled={
                      payuVerificationLoading ===
                      `complete-${selectedOwner._id}`
                    }
                  >
                    {payuVerificationLoading === `complete-${selectedOwner._id}`
                      ? 'Completing PayU Onboarding...'
                      : 'Complete PayU Onboarding'}
                  </button>
                )}
            </div>
          </section>

          <section>
            <h3>Account Dates</h3>

            <div className="admin-detail-grid">
              <div>
                <strong>Created At</strong>
                <span>
                  {selectedOwner.createdAt
                    ? new Date(selectedOwner.createdAt).toLocaleString()
                    : '—'}
                </span>
              </div>

              <div>
                <strong>Updated At</strong>
                <span>
                  {selectedOwner.updatedAt
                    ? new Date(selectedOwner.updatedAt).toLocaleString()
                    : '—'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default OwnerDetailsModal;
