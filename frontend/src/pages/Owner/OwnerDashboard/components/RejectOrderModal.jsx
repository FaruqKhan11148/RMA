function RejectOrderModal({
  showRejectModal,
  selectedRejectOrder,
  rejectingOrder,
  rejectionReason,
  rejectionDescription,
  setShowRejectModal,
  setSelectedRejectOrder,
  setRejectionReason,
  setRejectionDescription,
  handleRejectOrder,
}) {
  if (!showRejectModal || !selectedRejectOrder) {
    return null;
  }

  const closeModal = () => {
    if (rejectingOrder) return;

    setShowRejectModal(false);
    setSelectedRejectOrder(null);
    setRejectionReason('');
    setRejectionDescription('');
  };

  return (
    <div className="owner_reject_modal_overlay">
      <div className="owner_reject_modal">
        <div className="owner_reject_modal_header">
          <div>
            <h2>Reject Order</h2>

            <p>Order #{selectedRejectOrder.orderId}</p>
          </div>

          <button
            type="button"
            className="owner_reject_modal_close"
            onClick={closeModal}
          >
            ×
          </button>
        </div>

        <p className="owner_reject_modal_text">
          Please select a reason for rejecting this order.
        </p>

        <label
          htmlFor="owner_rejection_reason"
          className="owner_reject_modal_label"
        >
          Rejection Reason
        </label>

        <select
          id="owner_rejection_reason"
          className="owner_reject_modal_select"
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          disabled={rejectingOrder}
        >
          <option value="">Select a reason</option>
          <option value="Item unavailable">Item unavailable</option>
          <option value="Insufficient stock">Insufficient stock</option>
          <option value="Shop too busy">Shop too busy</option>
          <option value="Unable to prepare order">
            Unable to prepare order
          </option>
          <option value="Delivery unavailable">Delivery unavailable</option>
          <option value="Shop closing soon">Shop closing soon</option>
          <option value="Other">Other</option>
        </select>

        <label
          htmlFor="owner_rejection_description"
          className="owner_reject_modal_label"
        >
          Additional Details
        </label>

        <textarea
          id="owner_rejection_description"
          className="owner_reject_modal_textarea"
          value={rejectionDescription}
          onChange={(event) => setRejectionDescription(event.target.value)}
          placeholder="Add more details if needed..."
          rows={4}
          disabled={rejectingOrder}
        />

        <div className="owner_reject_modal_actions">
          <button
            type="button"
            className="owner_reject_modal_cancel"
            onClick={closeModal}
            disabled={rejectingOrder}
          >
            Keep Order
          </button>

          <button
            type="button"
            className="owner_reject_modal_confirm"
            onClick={handleRejectOrder}
            disabled={rejectingOrder}
          >
            {rejectingOrder ? 'Rejecting...' : 'Reject Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectOrderModal;
