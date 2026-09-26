function DeliveryLoginHeader({ isOtp }) {
  return (
    <div className="rma_delivery_login_header">
      <div className="rma_delivery_icon">{isOtp ? '✓' : 'R'}</div>

      <h1>{isOtp ? 'Verify OTP' : 'RMA Delivery Partner'}</h1>

      <p>
        {isOtp
          ? 'Enter the 6-digit OTP sent to your phone.'
          : 'Login to access your RMA delivery orders.'}
      </p>
    </div>
  );
}

export default DeliveryLoginHeader;
