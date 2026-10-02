function DeliveryAssignmentRequests({
  assignments,
  loading,
  error,
  processingAssignmentId,
  onAccept,
  onReject,
}) {
  if (loading) {
    return (
      <section className="delivery_assignment_requests">
        <div className="delivery_assignment_requests_header">
          <h2>Delivery Requests</h2>
        </div>

        <div className="delivery_assignment_message">
          Loading delivery requests...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="delivery_assignment_requests">
        <div className="delivery_assignment_requests_header">
          <h2>Delivery Requests</h2>
        </div>

        <div className="delivery_assignment_message delivery_assignment_error">
          {error}
        </div>
      </section>
    );
  }

  if (!assignments || assignments.length === 0) {
    return null;
  }

  return (
    <section className="delivery_assignment_requests">
      <div className="delivery_assignment_requests_header">
        <h2>Delivery Requests</h2>
        <span className="delivery_assignment_count">{assignments.length}</span>
      </div>

      <div className="delivery_assignment_list">
        {assignments.map((assignment) => (
          <article
            key={assignment.orderId}
            className="delivery_assignment_card"
          >
            <div className="delivery_assignment_card_top">
              <div>
                <p className="delivery_assignment_label">New Delivery</p>

                <h3>{assignment.orderId}</h3>
              </div>

              <span className="delivery_assignment_status">
                {assignment.deliveryAssignmentType === 'RMA'
                  ? 'RMA Delivery'
                  : 'Shop Delivery'}
              </span>
            </div>

            <div className="delivery_assignment_details">
              <div className="delivery_assignment_detail">
                <span>Shop</span>
                <strong>
                  {assignment.ownerId?.shopName ||
                    assignment.ownerId?.ownerName ||
                    'Shop'}
                </strong>
              </div>

              <div className="delivery_assignment_detail">
                <span>Customer</span>
                <strong>{assignment.customer?.name || 'Customer'}</strong>
              </div>

              <div className="delivery_assignment_detail">
                <span>Delivery Address</span>
                <strong>
                  {assignment.deliveryLocation?.address ||
                    assignment.customer?.address ||
                    'Address unavailable'}
                </strong>
              </div>

              <div className="delivery_assignment_detail">
                <span>Delivery Charge</span>
                <strong>
                  ₹{Number(assignment.deliveryCharge || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="delivery_assignment_actions">
              <button
                type="button"
                className="delivery_assignment_reject"
                onClick={() => onReject(assignment.orderId)}
                disabled={processingAssignmentId === assignment.orderId}
              >
                {processingAssignmentId === assignment.orderId
                  ? 'Processing...'
                  : 'Reject'}
              </button>

              <button
                type="button"
                className="delivery_assignment_accept"
                onClick={() => onAccept(assignment.orderId)}
                disabled={processingAssignmentId === assignment.orderId}
              >
                {processingAssignmentId === assignment.orderId
                  ? 'Processing...'
                  : 'Accept Delivery'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DeliveryAssignmentRequests;
