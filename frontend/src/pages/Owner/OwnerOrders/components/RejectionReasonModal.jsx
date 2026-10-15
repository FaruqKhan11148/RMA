function RejectionReasonModal({
  showRejectionModal,
  selectedRejectionOrder,
  rejectionReason,
  setRejectionReason,
  rejectionDescription,
  setRejectionDescription,
  rejectingOrder,
  setShowRejectionModal,
  confirmRejectOrder,
  paymentReceived,
  setPaymentReceived,
}) {
  if (!showRejectionModal) {
    return null;
  }

  const requiresPaymentDecision =
    selectedRejectionOrder?.paymentProvider === 'DIRECT_UPI' &&
    selectedRejectionOrder?.paymentMethod === 'DIRECT_UPI' &&
    selectedRejectionOrder?.paymentStatus !== 'Paid' &&
    selectedRejectionOrder?.ownerPaymentConfirmation?.status !== 'CONFIRMED';

  const closeModal = () => {
    if (rejectingOrder) {
      return;
    }

    setShowRejectionModal(false);
    setPaymentReceived(null);
  };

  const handleSubmit = () => {
    if (requiresPaymentDecision && typeof paymentReceived !== 'boolean') {
      return;
    }

    confirmRejectOrder();
  };

  return (
    <div className="rejection_reason_overlay" onClick={closeModal}>
      <section
        className="rejection_reason_modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rejection_reason_header">
          <div>
            <h2>Reject Order</h2>
            <p>Order #{selectedRejectionOrder?.orderId}</p>
          </div>

          <button
            type="button"
            className="rejection_reason_close"
            onClick={closeModal}
            disabled={rejectingOrder}
            aria-label="Close rejection dialog"
          >
            ×
          </button>
        </div>

        {requiresPaymentDecision && (
          <div className="rejection_reason_field">
            <p>
              <strong>Have you received the customer's UPI payment?</strong>
            </p>

            <p>
              Check your bank account or UPI app before choosing. If payment was
              received, a refund request will be created as part of rejection.
            </p>

            <label>
              <input
                type="radio"
                name="direct_upi_payment_received"
                checked={paymentReceived === true}
                onChange={() => setPaymentReceived(true)}
                disabled={rejectingOrder}
              />
              Yes, I verified that the money was received.
            </label>

            <label>
              <input
                type="radio"
                name="direct_upi_payment_received"
                checked={paymentReceived === false}
                onChange={() => setPaymentReceived(false)}
                disabled={rejectingOrder}
              />
              No, I verified that the money was not received.
            </label>
          </div>
        )}

        <div className="rejection_reason_field">
          <label htmlFor="rejection_reason">Reason for rejection</label>

          <select
            id="rejection_reason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            disabled={rejectingOrder}
          >
            <option value="">Select a reason</option>
            <option value="Product unavailable">Product unavailable</option>
            <option value="Shop is closed">Shop is closed</option>
            <option value="Delivery unavailable">Delivery unavailable</option>
            <option value="Order cannot be fulfilled">
              Order cannot be fulfilled
            </option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="rejection_reason_field">
          <label htmlFor="rejection_description">Additional details</label>

          <textarea
            id="rejection_description"
            value={rejectionDescription}
            onChange={(event) => setRejectionDescription(event.target.value)}
            placeholder="Add any additional details..."
            rows={4}
            disabled={rejectingOrder}
          />
        </div>

        <div className="rejection_reason_actions">
          <button
            type="button"
            className="rejection_cancel_button"
            onClick={closeModal}
            disabled={rejectingOrder}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rejection_confirm_button"
            onClick={handleSubmit}
            disabled={
              rejectingOrder ||
              !rejectionReason.trim() ||
              (requiresPaymentDecision && typeof paymentReceived !== 'boolean')
            }
          >
            {rejectingOrder ? 'Rejecting...' : 'Reject Order'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default RejectionReasonModal;
