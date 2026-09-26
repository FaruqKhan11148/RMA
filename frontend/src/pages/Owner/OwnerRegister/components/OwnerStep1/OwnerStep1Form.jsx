function OwnerStep1Form({
  ownerName,
  setOwnerName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  handleContinue,
  navigate,
}) {
  return (
    <>
      <form className="owner_step_form" onSubmit={handleContinue}>
        <section className="register_section">
          <h2>Owner Details</h2>

          <label>
            Owner Name
            <input
              type="text"
              placeholder="Enter your full name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </label>

          <label>
            Mobile Number
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Confirm Password
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
        </section>

        {error && <p className="owner_step_error">{error}</p>}

        <button className="owner_step_button" type="submit">
          Continue
        </button>
      </form>

      <div className="owner_step_footer">
        <p>Already have a shop?</p>

        <button
          onClick={() => {
            const token = localStorage.getItem('rma_owner_token');

            if (token) {
              navigate('/owner/dashboard');
            } else {
              navigate('/owner/login');
            }
          }}
        >
          Back to Login
        </button>
      </div>
    </>
  );
}

export default OwnerStep1Form;
