function DeliveryPersonRegisterForm({
  name,
  setName,
  phone,
  setPhone,
  handleRegister,
  loading,
  setError,
}) {
  return (
    <form onSubmit={handleRegister}>
      <div>
        <label>Delivery Person Name</label>

        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
      </div>

      <div>
        <label>Phone Number</label>

        <input
          type="tel"
          inputMode="numeric"
          maxLength="10"
          placeholder="Enter 10-digit phone number"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value.replace(/\D/g, ''));
            setError('');
          }}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register Delivery Person'}
      </button>
    </form>
  );
}

export default DeliveryPersonRegisterForm;
