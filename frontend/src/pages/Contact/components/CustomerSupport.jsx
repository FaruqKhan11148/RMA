function CustomerSupport() {
  return (
    <section className="contact_section">
      <div className="contact_section_heading">
        <h2>Customer Support</h2>

        <p>Need help with your order, payment, delivery, or account?</p>
      </div>

      <div className="contact_cards">
        <a href="tel:+919999999999" className="contact_card">
          <div className="contact_card_icon">☎</div>

          <div className="contact_card_content">
            <strong>Call Support</strong>

            <span>Speak directly with RMA support</span>
          </div>

          <span className="contact_card_arrow">›</span>
        </a>

        <a href="mailto:support@rma.com" className="contact_card">
          <div className="contact_card_icon">@</div>

          <div className="contact_card_content">
            <strong>Email Support</strong>

            <span>Send us your question or concern</span>
          </div>

          <span className="contact_card_arrow">›</span>
        </a>
      </div>
    </section>
  );
}

export default CustomerSupport;
