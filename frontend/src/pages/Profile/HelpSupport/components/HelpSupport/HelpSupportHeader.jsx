function HelpSupportHeader({ navigate }) {
  return (
    <div className="help_support_header">
      <button
        className="help_support_back"
        onClick={() => navigate('/profile')}
      >
        ‹
      </button>

      <h1>Help & Support</h1>
    </div>
  );
}

export default HelpSupportHeader;
