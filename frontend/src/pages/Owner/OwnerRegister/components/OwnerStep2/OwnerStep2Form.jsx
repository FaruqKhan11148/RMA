function OwnerStep2Form({
  shopName,
  setShopName,
  address,
  setAddress,
  description,
  setDescription,
  delivery,
  setDelivery,
  pickup,
  setPickup,
  error,
  handleContinue,
  handleBack,
  navigate,
}) {
  return (
    <>
      <form className="owner_step_form" onSubmit={handleContinue}>
        <section className="register_section">
          <h2>Shop Details</h2>

          <label>
            Shop Name
            <input
              type="text"
              placeholder="Enter your shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
            />
          </label>

          <label>
            Shop Address
            <textarea
              placeholder="Enter complete shop address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>

          <label>
            Shop Description
            <textarea
              placeholder="Example: Fresh chicken, fish and seafood"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </section>

        <section className="register_section">
          <h2>Order Options</h2>

          <p className="section_description">
            Select how customers can receive their orders.
          </p>

          <label className="checkbox_label">
            <input
              type="checkbox"
              checked={delivery}
              onChange={(e) => setDelivery(e.target.checked)}
            />
            Delivery Available
          </label>

          <label className="checkbox_label">
            <input
              type="checkbox"
              checked={pickup}
              onChange={(e) => setPickup(e.target.checked)}
            />
            Pickup Available
          </label>
        </section>

        {error && <p className="owner_step_error">{error}</p>}

        <div className="owner_step_actions">
          <button
            type="button"
            className="owner_step_back_button"
            onClick={handleBack}
          >
            Back
          </button>

          <button className="owner_step_button" type="submit">
            Continue
          </button>
        </div>
      </form>

      <div className="owner_step_footer">
        <p>Already have a shop?</p>

        <button onClick={() => navigate('/owner/login')}>Back to Login</button>
      </div>
    </>
  );
}

export default OwnerStep2Form;
