function DeliveryOtpCard({ order }) {
  return (
    <section className="delivery_otp_card">
      <h2>Delivery OTP</h2>

      {order.status === 'OutForDelivery' && !order.otpVerified && (
        <div className="delivery_status_otp_warning">
          <strong>Before sharing the OTP:</strong>

          <span>
            Please check the items, quantity, and quality of your order. Once
            you share the OTP, the order will be marked as delivered and
            delivery rejection will no longer be available.
          </span>
        </div>
      )}

      <div className="delivery_otp">{order.deliveryOtp}</div>
    </section>
  );
}

export default DeliveryOtpCard;
