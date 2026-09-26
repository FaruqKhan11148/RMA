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
}) {
  if (!showRejectionModal) {
    return null;
  }

  return (
    <div
      className="rejection_reason_overlay"
      onClick={() => {
        if (!rejectingOrder) {
          setShowRejectionModal(false);
        }
      }}
    >
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
            onClick={() => {
              if (!rejectingOrder) {
                setShowRejectionModal(false);
              }
            }}
          >
            ×
          </button>
        </div>

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
            onClick={() => {
              if (!rejectingOrder) {
                setShowRejectionModal(false);
              }
            }}
            disabled={rejectingOrder}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rejection_confirm_button"
            onClick={confirmRejectOrder}
            disabled={rejectingOrder || !rejectionReason}
          >
            {rejectingOrder ? 'Rejecting...' : 'Reject Order'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default RejectionReasonModal;
