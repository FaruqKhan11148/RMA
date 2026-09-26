function HelpSupportContact() {
  return (
    <section className="help_support_section">
      <div className="help_support_section_heading">
        <h2>Contact RMA</h2>

        <p>Need help from our support team?</p>
      </div>

      <div className="support_contact_list">
        <a className="support_contact_item" href="tel:+919999999999">
          <div className="support_contact_icon">☎</div>

          <div className="support_contact_text">
            <strong>Call Support</strong>

            <span>Speak with RMA support</span>
          </div>

          <span className="support_contact_arrow">›</span>
        </a>

        <a className="support_contact_item" href="mailto:support@rma.com">
          <div className="support_contact_icon">@</div>

          <div className="support_contact_text">
            <strong>Email Support</strong>

            <span>Send us your question</span>
          </div>

          <span className="support_contact_arrow">›</span>
        </a>
      </div>
    </section>
  );
}

export default HelpSupportContact;
