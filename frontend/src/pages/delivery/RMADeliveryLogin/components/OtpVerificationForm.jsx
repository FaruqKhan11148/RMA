import DeliveryLoginHeader from './DeliveryLoginHeader';

function OtpVerificationForm({
  otp,
  generatedOtp,
  loading,
  onOtpChange,
  onVerifyOtp,
  onChangePhone,
}) {
  return (
    <>
      <DeliveryLoginHeader isOtp />

      {generatedOtp && (
        <div className="rma_delivery_otp_display">
          <span>Your OTP</span>

          <strong style={{ color: 'black' }}>{generatedOtp}</strong>
        </div>
      )}

      <label htmlFor="rma_delivery_otp">OTP</label>

      <input
        id="rma_delivery_otp"
        type="text"
        inputMode="numeric"
        placeholder="Enter 6-digit OTP"
        value={otp}
        maxLength={6}
        onChange={onOtpChange}
      />

      <button
        type="button"
        className="rma_delivery_primary_button"
        onClick={onVerifyOtp}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <button
        type="button"
        className="rma_delivery_secondary_button"
        onClick={onChangePhone}
      >
        Change Phone Number
      </button>
    </>
  );
}

export default OtpVerificationForm;
