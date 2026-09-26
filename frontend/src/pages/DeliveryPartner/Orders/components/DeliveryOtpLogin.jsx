function DeliveryOtpLogin({
  otp,
  loading,
  error,
  successMessage,
  onOtpChange,
  onVerify,
  onBack,
}) {
  return (
    <main className="delivery_orders">
      <section className="delivery_no_orders">
        <h1>Verify OTP</h1>

        <p>Enter the 6-digit OTP sent to your delivery phone.</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength="6"
          placeholder="Enter OTP"
          value={otp}
          onChange={(event) => onOtpChange(event.target.value)}
        />

        <button
          className="delivery_complete_button"
          onClick={onVerify}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button className="delivery_complete_button" onClick={onBack}>
          Back
        </button>

        {successMessage && (
          <p className="delivery_success_message">{successMessage}</p>
        )}

        {error && <p className="delivery_error_message">{error}</p>}
      </section>
    </main>
  );
}

export default DeliveryOtpLogin;
