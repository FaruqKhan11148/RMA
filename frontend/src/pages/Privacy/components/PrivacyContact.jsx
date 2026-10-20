function PrivacyContact({ onContact }) {
  return (
    <section className="privacy_contact">
      <h2>Questions about privacy?</h2>

      <p>
        If you have questions about this Privacy Policy or need assistance with
        your personal information, contact RMA through our support page.
      </p>

      <button type="button" onClick={onContact}>
        Contact RMA Support
      </button>
    </section>
  );
}

export default PrivacyContact;
