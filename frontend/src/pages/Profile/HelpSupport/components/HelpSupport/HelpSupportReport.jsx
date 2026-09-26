function HelpSupportReport({ navigate }) {
  return (
    <section className="help_support_section">
      <div className="help_support_section_heading">
        <h2>Report an Issue</h2>

        <p>Something went wrong? Let us know.</p>
      </div>

      <button
        className="report_issue_button"
        onClick={() => navigate('/profile/help-support/report')}
      >
        <span>Report a problem</span>

        <span>›</span>
      </button>
    </section>
  );
}

export default HelpSupportReport;
