function DeliveryAssignmentModal({
  showDeliveryModal,
  selectedDeliveryOrder,
  deliveryAssignmentType,
  setDeliveryAssignmentType,
  deliveryPartners,
  selectedDeliveryPersonId,
  setSelectedDeliveryPersonId,
  loadingDeliveryPartners,
  assigningDelivery,
  startingRmaDispatch,
  rmaDispatchStatus,
  setShowDeliveryModal,
  assignDeliveryPartner,
  startRmaDelivery,
}) {
  if (!showDeliveryModal) {
    return null;
  }

  const isRma = deliveryAssignmentType === 'RMA';

  const isBusy = assigningDelivery || startingRmaDispatch;

  return (
    <div
      className="delivery_assignment_overlay"
      onClick={() => {
        if (!isBusy) {
          setShowDeliveryModal(false);
        }
      }}
    >
      <section
        className="delivery_assignment_modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delivery_assignment_header">
          <div>
            <h2>Send for Delivery</h2>

            <p>Order #{selectedDeliveryOrder?.orderId}</p>
          </div>

          <button
            type="button"
            className="delivery_assignment_close"
            onClick={() => {
              if (!isBusy) {
                setShowDeliveryModal(false);
              }
            }}
            disabled={isBusy}
          >
            ×
          </button>
        </div>

        <div className="delivery_assignment_type">
          <h3>Delivery Type</h3>

          <div className="delivery_type_options">
            <button
              type="button"
              className={
                deliveryAssignmentType === 'SHOP'
                  ? 'delivery_type_option active'
                  : 'delivery_type_option'
              }
              onClick={() => {
                if (isBusy) {
                  return;
                }

                setDeliveryAssignmentType('SHOP');
                setSelectedDeliveryPersonId('');
              }}
              disabled={isBusy}
            >
              <span className="delivery_radio">
                {deliveryAssignmentType === 'SHOP' ? '●' : '○'}
              </span>

              <span>
                <strong>Shop Delivery Partner</strong>
                <small>Your shop's delivery partner</small>
              </span>
            </button>

            <button
              type="button"
              className={
                deliveryAssignmentType === 'RMA'
                  ? 'delivery_type_option active'
                  : 'delivery_type_option'
              }
              onClick={() => {
                if (isBusy) {
                  return;
                }

                setDeliveryAssignmentType('RMA');
                setSelectedDeliveryPersonId('');
              }}
              disabled={isBusy}
            >
              <span className="delivery_radio">
                {deliveryAssignmentType === 'RMA' ? '●' : '○'}
              </span>

              <span>
                <strong>RMA Delivery Partner</strong>
                <small>Automatically assigned by RMA</small>
              </span>
            </button>
          </div>
        </div>

        {isRma ? (
          <div className="delivery_rma_dispatch">
            <div className="delivery_partner_list_header">
              <h3>RMA Delivery</h3>
            </div>

            <div className="delivery_rma_dispatch_info">
              <strong>
                RMA will automatically find a nearby delivery partner for this
                order.
              </strong>

              <p>
                You do not need to select a delivery partner. RMA will offer the
                order to an eligible nearby partner.
              </p>
            </div>

            {rmaDispatchStatus && (
              <div className="delivery_rma_dispatch_status">
                {rmaDispatchStatus}
              </div>
            )}
          </div>
        ) : (
          <div className="delivery_partner_list">
            <div className="delivery_partner_list_header">
              <h3>Shop Delivery Partners</h3>
            </div>

            {loadingDeliveryPartners ? (
              <div className="delivery_partner_loading">
                Loading delivery partners...
              </div>
            ) : deliveryPartners.SHOP?.length === 0 ? (
              <div className="delivery_partner_empty">
                <strong>No shop delivery partner available</strong>

                <p>Your shop does not have an active delivery partner.</p>
              </div>
            ) : (
              deliveryPartners.SHOP.map((partner) => (
                <button
                  type="button"
                  key={partner.id}
                  className={
                    selectedDeliveryPersonId === partner.id
                      ? 'delivery_partner_card selected'
                      : 'delivery_partner_card'
                  }
                  onClick={() => setSelectedDeliveryPersonId(partner.id)}
                  disabled={isBusy}
                >
                  <span className="delivery_partner_radio">
                    {selectedDeliveryPersonId === partner.id ? '●' : '○'}
                  </span>

                  <span className="delivery_partner_details">
                    <strong>{partner.name}</strong>

                    <span>{partner.phone}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="delivery_assignment_actions">
          <button
            type="button"
            className="delivery_cancel_button"
            onClick={() => {
              if (!isBusy) {
                setShowDeliveryModal(false);
              }
            }}
            disabled={isBusy}
          >
            Cancel
          </button>

          {isRma ? (
            <button
              type="button"
              className="delivery_assign_button"
              onClick={startRmaDelivery}
              disabled={
                startingRmaDispatch ||
                assigningDelivery ||
                Boolean(rmaDispatchStatus)
              }
            >
              {startingRmaDispatch
                ? 'Finding Partner...'
                : rmaDispatchStatus
                  ? 'Dispatch Started'
                  : 'Start RMA Delivery'}
            </button>
          ) : (
            <button
              type="button"
              className="delivery_assign_button"
              onClick={assignDeliveryPartner}
              disabled={
                assigningDelivery ||
                !selectedDeliveryPersonId ||
                loadingDeliveryPartners
              }
            >
              {assigningDelivery ? 'Assigning...' : 'Assign Delivery'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default DeliveryAssignmentModal;
