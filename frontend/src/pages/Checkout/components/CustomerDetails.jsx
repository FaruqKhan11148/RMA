function CustomerDetails({ customer, onChange, onSubmit, orderType }) {
  return (
    <section className="checkout_card checkout_customer_card">
      <div className="checkout_card_header">
        <div>
          <span className="checkout_step">02</span>

          <div>
            <h2>Your Details</h2>

            <p>Enter your contact information.</p>
          </div>
        </div>
      </div>

      <form id="checkout-form" className="checkout_form" onSubmit={onSubmit}>
        <div className="checkout_form_group">
          <label htmlFor="checkout-name">Full Name</label>

          <input
            id="checkout-name"
            type="text"
            name="name"
            placeholder="Enter your name"
            value={customer.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="checkout_form_group">
          <label htmlFor="checkout-phone">Mobile Number</label>

          <input
            id="checkout-phone"
            type="tel"
            name="phone"
            placeholder="Enter your mobile number"
            value={customer.phone}
            onChange={onChange}
            required
          />
        </div>

        {orderType === 'delivery' && (
          <div className="checkout_form_group">
            <label htmlFor="checkout-address">Detailed Delivery Address</label>

            <textarea
              id="checkout-address"
              name="address"
              placeholder="Enter your complete delivery address"
              value={customer.address}
              onChange={onChange}
              required
            />
          </div>
        )}
      </form>
    </section>
  );
}

export default CustomerDetails;
