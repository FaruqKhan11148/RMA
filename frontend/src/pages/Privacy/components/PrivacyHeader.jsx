function PrivacyHeader({ onBack }) {
  return (
    <div className="privacy_header">
      <button className="privacy_back" onClick={onBack}>
        ‹
      </button>

      <h1>Privacy Policy</h1>
    </div>
  );
}

export default PrivacyHeader;
