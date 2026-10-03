import { useState } from 'react';

import {
  fetchEligibleRmaDeliveryPartners,
  assignRmaDeliveryPartner,
} from '../../utils/Orders/ordersApi';

function OrderDetailsModal({
  selectedOrder,
  onClose,
  formatDate,
  getStatusClass,
  onOrderUpdated,
}) {
  const [showRmaPartners, setShowRmaPartners] = useState(false);
  const [rmaPartners, setRmaPartners] = useState([]);
  const [rmaPartnersLoading, setRmaPartnersLoading] = useState(false);
  const [rmaPartnersError, setRmaPartnersError] = useState('');
  const [assigningPartnerId, setAssigningPartnerId] = useState(null);

  if (!selectedOrder) {
    return null;
  }

  const order = selectedOrder;
  const customer = order.customer || {};
  const owner = order.ownerId || {};
  const delivery = order.delivery || {};
  const deliveryPerson = order.deliveryPersonId || {};

  const isDeliveryOrder = order.orderType === 'delivery';

  const isReadyForAssignment =
    isDeliveryOrder &&
    order.status === 'Ready' &&
    order.deliveryAssignmentType !== 'SHOP' &&
    order.deliveryAssignmentStatus !== 'ACCEPTED';

  const getAssignmentTypeLabel = () => {
    if (order.deliveryAssignmentType === 'SHOP') {
      return 'Shop Delivery';
    }

    if (order.deliveryAssignmentType === 'RMA') {
      return 'RMA Delivery';
    }

    return 'Not Assigned';
  };

  const getAssignmentStatusLabel = () => {
    if (order.deliveryAssignmentStatus === 'ACCEPTED') {
      return 'Accepted';
    }

    if (order.deliveryAssignmentStatus === 'PENDING') {
      return 'Pending';
    }

    if (order.deliveryAssignmentStatus === 'REJECTED') {
      return 'Rejected';
    }

    if (order.deliveryAssignmentStatus === 'CANCELLED') {
      return 'Cancelled';
    }

    return 'Not Assigned';
  };

  const getPickupStatusLabel = () => {
    if (order.deliveryPickupStatus === 'COLLECTED') {
      return 'Collected';
    }

    return 'Pending';
  };

  const handleLoadRmaPartners = async () => {
    try {
      setShowRmaPartners(true);
      setRmaPartnersLoading(true);
      setRmaPartnersError('');

      const data = await fetchEligibleRmaDeliveryPartners(order.orderId);

      setRmaPartners(data.partners || []);
    } catch (error) {
      console.error('Failed to load RMA delivery partners:', error);

      setRmaPartnersError(
        error.message || 'Failed to load RMA delivery partners',
      );
    } finally {
      setRmaPartnersLoading(false);
    }
  };

  const handleAssignRmaPartner = async (partner) => {
    try {
      setAssigningPartnerId(partner._id);
      setRmaPartnersError('');

      const data = await assignRmaDeliveryPartner(order.orderId, partner._id);

      if (data.order) {
        setRmaPartners([]);
        setShowRmaPartners(false);

        if (onOrderUpdated) {
          onOrderUpdated(data.order);
        }
      }
    } catch (error) {
      console.error('Failed to assign RMA delivery partner:', error);

      setRmaPartnersError(
        error.message || 'Failed to assign RMA delivery partner',
      );
    } finally {
      setAssigningPartnerId(null);
    }
  };

  return (
    <div className="admin-order-modal-overlay">
      <div className="admin-order-modal">
        {/* HEADER */}
        <div className="admin-order-modal-header">
          <div>
            <h2>Order Details</h2>

            <p>{order.orderId || '-'}</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* CURRENT STATUS */}
        <div className="order-modal-status">
          <span>Current Status</span>

          <span
            className={`order-status-badge ${getStatusClass(order.status)}`}
          >
            {order.status || '-'}
          </span>
        </div>

        {/* TIMELINE */}
        <div className="order-timeline-section">
          <h3>Order Timeline</h3>

          <div className="order-timeline">
            <div className="timeline-item timeline-completed">
              <div className="timeline-dot" />

              <div>
                <strong>Order Created</strong>

                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {order.acceptedAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Accepted</strong>

                  <span>{formatDate(order.acceptedAt)}</span>
                </div>
              </div>
            )}

            {order.preparingAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Preparing</strong>

                  <span>{formatDate(order.preparingAt)}</span>
                </div>
              </div>
            )}

            {order.readyAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Ready</strong>

                  <span>{formatDate(order.readyAt)}</span>
                </div>
              </div>
            )}

            {order.outForDeliveryAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Out for Delivery</strong>

                  <span>{formatDate(order.outForDeliveryAt)}</span>
                </div>
              </div>
            )}

            {order.otpVerified && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>OTP Verified</strong>

                  <span>Delivery OTP verified</span>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div className="timeline-item timeline-completed">
                <div className="timeline-dot" />

                <div>
                  <strong>Completed</strong>

                  <span>{formatDate(order.completedAt)}</span>
                </div>
              </div>
            )}

            {order.rejectedAt && (
              <div className="timeline-item timeline-rejected">
                <div className="timeline-dot" />

                <div>
                  <strong>Rejected</strong>

                  <span>{formatDate(order.rejectedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER */}
        <div className="order-detail-section">
          <h3>Customer Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Name</label>

              <p>{customer.name || '-'}</p>
            </div>

            <div>
              <label>Phone</label>

              <p>{customer.phone || '-'}</p>
            </div>

            {customer.email && (
              <div>
                <label>Email</label>

                <p>{customer.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* SHOP / OWNER */}
        <div className="order-detail-section">
          <h3>Shop / Owner Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Shop Name</label>

              <p>{owner.shopName || '-'}</p>
            </div>

            <div>
              <label>Shop ID</label>

              <p>{owner.shopId || '-'}</p>
            </div>

            <div>
              <label>Owner Name</label>

              <p>{owner.ownerName || '-'}</p>
            </div>

            <div>
              <label>Owner Phone</label>

              <p>{owner.phone || owner.ownerPhone || '-'}</p>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="order-detail-section">
          <h3>Order Items</h3>

          <div className="order-items">
            {(order.items || []).map((item, index) => {
              const quantity = Number(item.quantity || 0);

              const price = Number(item.price || 0);

              const lineTotal = price * quantity;

              return (
                <div
                  className="order-item"
                  key={
                    item.productId ||
                    item.catalogueProductId ||
                    `${item.name}-${index}`
                  }
                >
                  <div>
                    <strong>{item.name || '-'}</strong>

                    <span>
                      {quantity} × ₹{price.toFixed(2)}
                      {item.unit ? ` / ${item.unit}` : ''}
                    </span>
                  </div>

                  <strong>₹{lineTotal.toFixed(2)}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* DELIVERY */}
        <div className="order-detail-section">
          <h3>Delivery Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Order Type</label>

              <p>{order.orderType || '-'}</p>
            </div>

            <div>
              <label>Delivery Status</label>

              <p>{order.deliveryStatus || '-'}</p>
            </div>

            <div>
              <label>Address</label>

              <p>
                {order.deliveryLocation?.address ||
                  delivery.address ||
                  order.deliveryAddress ||
                  order.address ||
                  '-'}
              </p>
            </div>

            <div>
              <label>Latitude</label>

              <p>
                {order.deliveryLocation?.latitude ??
                  delivery.latitude ??
                  order.latitude ??
                  '-'}
              </p>
            </div>

            <div>
              <label>Longitude</label>

              <p>
                {order.deliveryLocation?.longitude ??
                  delivery.longitude ??
                  order.longitude ??
                  '-'}
              </p>
            </div>

            {order.deliveryDistance !== undefined && (
              <div>
                <label>Distance</label>

                <p>{Number(order.deliveryDistance || 0).toFixed(2)} KM</p>
              </div>
            )}

            {order.deliveryCharge !== undefined && (
              <div>
                <label>Delivery Charge</label>

                <p>₹{Number(order.deliveryCharge || 0).toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* DELIVERY ASSIGNMENT */}
        {isDeliveryOrder && (
          <div className="order-detail-section">
            <h3>Delivery Assignment</h3>

            <div className="order-detail-grid">
              <div>
                <label>Delivery Method</label>

                <p>{getAssignmentTypeLabel()}</p>
              </div>

              <div>
                <label>Assignment Status</label>

                <p>{getAssignmentStatusLabel()}</p>
              </div>

              <div>
                <label>Pickup Status</label>

                <p>{getPickupStatusLabel()}</p>
              </div>

              <div>
                <label>Delivery Partner</label>

                <p>{deliveryPerson.name || 'Not Assigned'}</p>
              </div>

              {deliveryPerson.phone && (
                <div>
                  <label>Partner Phone</label>

                  <p>{deliveryPerson.phone}</p>
                </div>
              )}

              {deliveryPerson.deliveryType && (
                <div>
                  <label>Partner Type</label>

                  <p>{deliveryPerson.deliveryType}</p>
                </div>
              )}

              {deliveryPerson.availabilityStatus && (
                <div>
                  <label>Partner Availability</label>

                  <p>{deliveryPerson.availabilityStatus}</p>
                </div>
              )}
            </div>

            {isReadyForAssignment && (
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button type="button" onClick={handleLoadRmaPartners}>
                  Assign RMA Partner
                </button>

                {showRmaPartners && (
                  <div
                    style={{
                      marginTop: '16px',
                      borderTop: '1px solid #ddd',
                      paddingTop: '16px',
                    }}
                  >
                    <h4>Available RMA Delivery Partners</h4>

                    {rmaPartnersLoading && (
                      <p>Loading available delivery partners...</p>
                    )}

                    {rmaPartnersError && <p>{rmaPartnersError}</p>}

                    {!rmaPartnersLoading &&
                      !rmaPartnersError &&
                      rmaPartners.length === 0 && (
                        <p>
                          No eligible RMA delivery partners are currently
                          available.
                        </p>
                      )}

                    {!rmaPartnersLoading &&
                      !rmaPartnersError &&
                      rmaPartners.length > 0 && (
                        <div>
                          {rmaPartners.map((partner) => (
                            <div
                              key={partner._id}
                              style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px',
                                marginTop: '10px',
                              }}
                            >
                              <div>
                                <strong>{partner.name}</strong>
                              </div>

                              <div>
                                <span>{partner.phone}</span>
                              </div>

                              <div>
                                <span>
                                  Distance to shop:{' '}
                                  {Number(partner.distanceToShop || 0).toFixed(
                                    2,
                                  )}{' '}
                                  KM
                                </span>
                              </div>

                              <div>
                                <span>
                                  Status: {partner.availabilityStatus}
                                </span>
                              </div>

                              <div>
                                <span>
                                  GPS updated:{' '}
                                  {partner.currentLocation?.updatedAt
                                    ? formatDate(
                                        partner.currentLocation.updatedAt,
                                      )
                                    : '-'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAssignRmaPartner(partner)}
                                disabled={assigningPartnerId === partner._id}
                              >
                                {assigningPartnerId === partner._id
                                  ? 'Assigning...'
                                  : 'Select Partner'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT */}
        <div className="order-detail-section">
          <h3>Payment Information</h3>

          <div className="order-detail-grid">
            <div>
              <label>Payment Status</label>

              <p>{order.paymentStatus || '-'}</p>
            </div>

            <div>
              <label>Payment Method</label>

              <p>{order.paymentMethod || '-'}</p>
            </div>

            <div>
              <label>Online Payment Method</label>

              <p>{order.onlinePaymentMethod || '-'}</p>
            </div>

            {order.transactionId && (
              <div>
                <label>Transaction ID</label>

                <p>{order.transactionId}</p>
              </div>
            )}

            {order.payuTransactionId && (
              <div>
                <label>PayU Transaction ID</label>

                <p>{order.payuTransactionId}</p>
              </div>
            )}

            <div>
              <label>Order Amount</label>

              <p>₹{Number(order.totalPrice || 0).toFixed(2)}</p>
            </div>

            <div>
              <label>Customer Paid</label>

              <p>
                ₹
                {Number(
                  order.customerPayableAmount ?? order.totalPrice ?? 0,
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* FINANCE */}
        <div className="order-detail-section">
          <h3>Finance Information</h3>

          <div className="order-finance-grid">
            <div>
              <span>Order Total</span>

              <strong>₹{Number(order.totalPrice || 0).toFixed(2)}</strong>
            </div>

            <div>
              <span>RMA Fee</span>

              <strong>₹{Number(order.rmaFee || 0).toFixed(2)}</strong>
            </div>

            <div>
              <span>Owner Amount</span>

              <strong>₹{Number(order.ownerAmount || 0).toFixed(2)}</strong>
            </div>
          </div>

          {(order.payuFee !== undefined ||
            order.payuGst !== undefined ||
            order.payuCharges !== undefined) && (
            <div className="order-finance-grid">
              <div>
                <span>PayU Fee</span>

                <strong>₹{Number(order.payuFee || 0).toFixed(2)}</strong>
              </div>

              <div>
                <span>PayU GST</span>

                <strong>₹{Number(order.payuGst || 0).toFixed(2)}</strong>
              </div>

              <div>
                <span>PayU Charges</span>

                <strong>₹{Number(order.payuCharges || 0).toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* DELIVERY OTP */}
        <div className="order-detail-section">
          <h3>Delivery OTP</h3>

          <div
            className={`otp-status-box ${
              order.otpVerified ? 'otp-verified' : 'otp-not-verified'
            }`}
          >
            <span>Status</span>

            <strong>
              {order.otpVerified ? 'OTP Verified' : 'OTP Not Verified'}
            </strong>

            {order.deliveryOtp && <small>OTP: {order.deliveryOtp}</small>}

            {order.otpVerifiedAt && (
              <small>Verified At: {formatDate(order.otpVerifiedAt)}</small>
            )}
          </div>
        </div>

        {/* SYSTEM TIMESTAMPS */}
        <div className="order-detail-section">
          <h3>System Timestamps</h3>

          <div className="order-detail-grid">
            <div>
              <label>Created At</label>

              <p>{formatDate(order.createdAt)}</p>
            </div>

            <div>
              <label>Updated At</label>

              <p>{formatDate(order.updatedAt)}</p>
            </div>

            {order.acceptedAt && (
              <div>
                <label>Accepted At</label>

                <p>{formatDate(order.acceptedAt)}</p>
              </div>
            )}

            {order.preparingAt && (
              <div>
                <label>Preparing At</label>

                <p>{formatDate(order.preparingAt)}</p>
              </div>
            )}

            {order.readyAt && (
              <div>
                <label>Ready At</label>

                <p>{formatDate(order.readyAt)}</p>
              </div>
            )}

            {order.outForDeliveryAt && (
              <div>
                <label>Out For Delivery At</label>

                <p>{formatDate(order.outForDeliveryAt)}</p>
              </div>
            )}

            {order.completedAt && (
              <div>
                <label>Completed At</label>

                <p>{formatDate(order.completedAt)}</p>
              </div>
            )}

            {order.rejectedAt && (
              <div>
                <label>Rejected At</label>

                <p>{formatDate(order.rejectedAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="admin-order-modal-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
