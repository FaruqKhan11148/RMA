function DeliveryLogin({
  shopId,
  phone,
  loading,
  error,
  onShopIdChange,
  onPhoneChange,
  onRequestOtp,
}) {
  return (
    <main className="delivery_orders">
      <section className="delivery_no_orders">
        <h1>RMA Deliver</h1>

        <p>Login to access your delivery orders.</p>

        <input
          type="text"
          placeholder="Enter Shop ID"
          value={shopId}
          onChange={(event) => onShopIdChange(event.target.value)}
        />

        <input
          type="tel"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          maxLength="10"
        />

        <button
          className="delivery_complete_button"
          onClick={onRequestOtp}
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

        {error && <p className="delivery_error_message">{error}</p>}
      </section>
    </main>
  );
}

export default DeliveryLogin;
