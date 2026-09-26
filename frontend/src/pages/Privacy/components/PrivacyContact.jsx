function PrivacyContact({ onContact }) {
  return (
    <section className="privacy_contact">
      <h2>Questions about privacy?</h2>

      <p>
        If you have questions or concerns about this Privacy Policy, please
        contact RMA through our support page.
      </p>

      <button onClick={onContact}>Contact RMA Support</button>
    </section>
  );
}

export default PrivacyContact;
