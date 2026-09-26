function OrderActionModal({
  type,
  reason,
  description = '',
  error,
  processing,
  onReasonChange,
  onDescriptionChange,
  onClose,
  onConfirm,
}) {
  const isReject = type === 'reject';

  const reasons = isReject
    ? [
        'Wrong product',
        'Missing item',
        'Less quantity',
        'Poor quality',
        'Damaged product',
        'Other',
      ]
    : [
        'Changed my mind',
        'Ordered by mistake',
        'Taking too long',
        'No longer needed',
        'Other',
      ];

  return (
    <div className="delivery_status_modal_overlay">
      <div className="delivery_status_modal">
        <div className="delivery_status_modal_header">
          <h3>{isReject ? 'Report an Issue' : 'Cancel Order'}</h3>

          <button
            type="button"
            className="delivery_status_modal_close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="delivery_status_modal_text">
          {isReject
            ? 'Please check your order before sharing the OTP. If there is a genuine issue, you can reject the delivery now.'
            : 'Are you sure you want to cancel this order?'}
        </p>

        <label
          htmlFor={isReject ? 'reject_reason' : 'cancel_reason'}
          className="delivery_status_modal_label"
        >
          Reason
        </label>

        <select
          id={isReject ? 'reject_reason' : 'cancel_reason'}
          className="delivery_status_modal_select"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={processing}
        >
          <option value="">Select a reason</option>

          {reasons.map((reasonOption) => (
            <option key={reasonOption} value={reasonOption}>
              {reasonOption}
            </option>
          ))}
        </select>

        {isReject && (
          <>
            <label
              htmlFor="reject_description"
              className="delivery_status_modal_label"
            >
              Additional details
            </label>

            <textarea
              id="reject_description"
              className="delivery_status_modal_textarea"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Describe the issue (optional)"
              rows={4}
              disabled={processing}
            />
          </>
        )}

        {error && <p className="delivery_status_modal_error">{error}</p>}

        <div className="delivery_status_modal_actions">
          <button
            type="button"
            className="delivery_status_modal_secondary"
            onClick={onClose}
            disabled={processing}
          >
            Keep Order
          </button>

          <button
            type="button"
            className="delivery_status_modal_danger"
            onClick={onConfirm}
            disabled={processing}
          >
            {processing
              ? 'Processing...'
              : isReject
                ? 'Reject Delivery'
                : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderActionModal;
