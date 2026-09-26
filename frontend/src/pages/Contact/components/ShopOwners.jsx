function ShopOwners({ onPartner }) {
  return (
    <section className="contact_section">
      <div className="contact_section_heading">
        <h2>Shop Owners</h2>

        <p>Interested in registering your shop or partnering with RMA?</p>
      </div>

      <button className="contact_action_button" onClick={onPartner}>
        <span>Partner With RMA</span>

        <span>›</span>
      </button>
    </section>
  );
}

export default ShopOwners;
