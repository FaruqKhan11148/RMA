import DeliveryLoginHeader from './DeliveryLoginHeader';
import DeliveryLoginMessages from './DeliveryLoginMessages';

function PhoneLoginForm({
  phone,
  password,
  loading,
  lockoutSeconds,
  successMessage,
  error,
  onPhoneChange,
  onPasswordChange,
  onLogin,
  onRegister,
  onParticularShop,
}) {
  const isLocked = lockoutSeconds > 0;

  return (
    <>
      <DeliveryLoginHeader isOtp={false} />

      <label htmlFor="rma_delivery_phone">Phone Number</label>

      <input
        id="rma_delivery_phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="Enter 10-digit phone number"
        value={phone}
        maxLength={10}
        onChange={onPhoneChange}
        disabled={loading}
      />

      <label htmlFor="rma_delivery_password">Password</label>

      <input
        id="rma_delivery_password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={onPasswordChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !loading) {
            onLogin();
          }
        }}
        disabled={loading}
      />

      <button
        type="button"
        className="rma_delivery_primary_button"
        onClick={onLogin}
        disabled={loading}
      >
        {isLocked
          ? `Try again in ${lockoutSeconds}s`
          : loading
            ? 'Logging in...'
            : 'Login'}
      </button>

      <DeliveryLoginMessages successMessage={successMessage} error={error} />

      <div className="rma_delivery_register_prompt">
        <span>Not registered as an RMA delivery partner?</span>

        <button
          type="button"
          onClick={onRegister}
          disabled={loading || isLocked}
        >
          Register Now
        </button>

        <button
          type="button"
          onClick={onParticularShop}
          disabled={loading || isLocked}
        >
          Particular Shop
        </button>
      </div>
    </>
  );
}

export default PhoneLoginForm;
