function ContactHeader({ onBack }) {
  return (
    <div className="contact_header">
      <button className="contact_back" onClick={onBack}>
        ‹
      </button>

      <h1>Contact Us</h1>
    </div>
  );
}

export default ContactHeader;
