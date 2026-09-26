function OrderDetailsDelivery({ order, formatDateTime }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-header">
        <div>
          <h2>Delivery</h2>
          <p>Delivery information for this order.</p>
        </div>

        <span className="admin-order-type-badge">
          {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
        </span>
      </div>

      {order.orderType === 'delivery' ? (
        <>
          <div className="admin-order-info-grid">
            <div className="admin-order-info-wide">
              <span>Delivery Address</span>
              <strong>
                {order.deliveryLocation?.address ||
                  order.customer?.address ||
                  '—'}
              </strong>
            </div>

            <div>
              <span>Latitude</span>
              <strong>{order.deliveryLocation?.latitude ?? '—'}</strong>
            </div>

            <div>
              <span>Longitude</span>
              <strong>{order.deliveryLocation?.longitude ?? '—'}</strong>
            </div>

            <div>
              <span>OTP Generated</span>
              <strong>{formatDateTime(order.deliveryOtpGeneratedAt)}</strong>
            </div>

            <div>
              <span>OTP Verification</span>
              <strong
                className={
                  order.otpVerified ? 'admin-otp-verified' : 'admin-otp-pending'
                }
              >
                {order.otpVerified ? 'Verified' : 'Not Verified'}
              </strong>
            </div>
          </div>
        </>
      ) : (
        <div className="admin-pickup-message">
          This order is for customer pickup.
        </div>
      )}
    </section>
  );
}

export default OrderDetailsDelivery;
