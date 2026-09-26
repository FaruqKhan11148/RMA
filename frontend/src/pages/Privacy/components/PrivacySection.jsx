function PrivacySection({ title, children }) {
  return (
    <section className="privacy_section">
      <h2>{title}</h2>

      {children}
    </section>
  );
}

export default PrivacySection;
