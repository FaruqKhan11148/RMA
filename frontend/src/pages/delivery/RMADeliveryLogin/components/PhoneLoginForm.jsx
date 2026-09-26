import DeliveryLoginHeader from './DeliveryLoginHeader';

function PhoneLoginForm({
  phone,
  loading,
  onPhoneChange,
  onRequestOtp,
  onRegister,
  onParticularShop,
}) {
  return (
    <>
      <DeliveryLoginHeader isOtp={false} />

      <label htmlFor="rma_delivery_phone">Phone Number</label>

      <input
        id="rma_delivery_phone"
        type="tel"
        inputMode="numeric"
        placeholder="Enter phone number"
        value={phone}
        maxLength={10}
        onChange={onPhoneChange}
      />

      <button
        type="button"
        className="rma_delivery_primary_button"
        onClick={onRequestOtp}
        disabled={loading}
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>

      <div className="rma_delivery_register_prompt">
        <span>Not registered as an RMA delivery partner?</span>

        <button type="button" onClick={onRegister}>
          Register Now
        </button>

        <button type="button" onClick={onParticularShop}>
          Particular Shop
        </button>
      </div>
    </>
  );
}

export default PhoneLoginForm;
