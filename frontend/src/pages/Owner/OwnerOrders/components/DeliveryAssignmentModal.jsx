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
  setShowDeliveryModal,
  assignDeliveryPartner,
}) {
  if (!showDeliveryModal) {
    return null;
  }

  return (
    <div
      className="delivery_assignment_overlay"
      onClick={() => {
        if (!assigningDelivery) {
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
            <h2>Assign Delivery Partner</h2>

            <p>Order #{selectedDeliveryOrder?.orderId}</p>
          </div>

          <button
            type="button"
            className="delivery_assignment_close"
            onClick={() => {
              if (!assigningDelivery) {
                setShowDeliveryModal(false);
              }
            }}
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
                setDeliveryAssignmentType('SHOP');
                setSelectedDeliveryPersonId('');
              }}
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
                setDeliveryAssignmentType('RMA');
                setSelectedDeliveryPersonId('');
              }}
            >
              <span className="delivery_radio">
                {deliveryAssignmentType === 'RMA' ? '●' : '○'}
              </span>

              <span>
                <strong>RMA Delivery Partner</strong>
                <small>Nearby RMA delivery partners</small>
              </span>
            </button>
          </div>
        </div>

        <div className="delivery_partner_list">
          <div className="delivery_partner_list_header">
            <h3>
              {deliveryAssignmentType === 'RMA'
                ? 'Nearby RMA Partners'
                : 'Shop Delivery Partners'}
            </h3>

            {deliveryAssignmentType === 'RMA' && <span>Nearest 5</span>}
          </div>

          {loadingDeliveryPartners ? (
            <div className="delivery_partner_loading">
              Loading delivery partners...
            </div>
          ) : deliveryPartners[deliveryAssignmentType]?.length === 0 ? (
            <div className="delivery_partner_empty">
              <strong>
                {deliveryAssignmentType === 'RMA'
                  ? 'No nearby RMA partners available'
                  : 'No shop delivery partner available'}
              </strong>

              <p>
                {deliveryAssignmentType === 'RMA'
                  ? 'There are currently no approved RMA delivery partners nearby.'
                  : 'Your shop does not have an active delivery partner.'}
              </p>
            </div>
          ) : (
            deliveryPartners[deliveryAssignmentType].map((partner) => (
              <button
                type="button"
                key={partner.id}
                className={
                  selectedDeliveryPersonId === partner.id
                    ? 'delivery_partner_card selected'
                    : 'delivery_partner_card'
                }
                onClick={() => setSelectedDeliveryPersonId(partner.id)}
              >
                <span className="delivery_partner_radio">
                  {selectedDeliveryPersonId === partner.id ? '●' : '○'}
                </span>

                <span className="delivery_partner_details">
                  <strong>{partner.name}</strong>

                  <span>{partner.phone}</span>

                  {deliveryAssignmentType === 'RMA' && (
                    <span className="delivery_partner_distance">
                      {partner.distance} km away
                    </span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="delivery_assignment_actions">
          <button
            type="button"
            className="delivery_cancel_button"
            onClick={() => {
              if (!assigningDelivery) {
                setShowDeliveryModal(false);
              }
            }}
            disabled={assigningDelivery}
          >
            Cancel
          </button>

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
        </div>
      </section>
    </div>
  );
}

export default DeliveryAssignmentModal;
