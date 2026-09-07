import './Contact.css';

import { useNavigate } from 'react-router-dom';

function Contact() {
  const navigate = useNavigate();

  return (
    <main className="contact_page">
      {/* HEADER */}
      <div className="contact_header">
        <button className="contact_back" onClick={() => navigate(-1)}>
          ‹
        </button>

        <h1>Contact Us</h1>
      </div>

      <div className="contact_container">
        {/* INTRO */}
        <section className="contact_intro">
          <span className="contact_badge">RMA SUPPORT</span>

          <h2>We're here to help.</h2>

          <p>
            Have a question, need help with an order, or want to partner with
            RMA? Get in touch with our team.
          </p>
        </section>

        {/* CUSTOMER SUPPORT */}
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

        {/* SHOP OWNERS */}
        <section className="contact_section">
          <div className="contact_section_heading">
            <h2>Shop Owners</h2>

            <p>Interested in registering your shop or partnering with RMA?</p>
          </div>

          <button
            className="contact_action_button"
            onClick={() => navigate('/owner/register/step-1')}
          >
            <span>Partner With RMA</span>

            <span>›</span>
          </button>
        </section>

        {/* HELP */}
        <section className="contact_section">
          <div className="contact_section_heading">
            <h2>Need More Help?</h2>

            <p>
              Check our frequently asked questions or report an issue with your
              order.
            </p>
          </div>

          <button
            className="contact_action_button"
            onClick={() => navigate('/profile/help-support')}
          >
            <span>Visit Help & Support</span>

            <span>›</span>
          </button>
        </section>

        {/* BUSINESS */}
        <section className="contact_business_card">
          <h2>RMA</h2>

          <p>
            Fresh meat and seafood from local shops, delivered conveniently to
            your doorstep.
          </p>

          <span>Fresh. Local. Convenient.</span>
        </section>
      </div>
    </main>
  );
}

export default Contact;
