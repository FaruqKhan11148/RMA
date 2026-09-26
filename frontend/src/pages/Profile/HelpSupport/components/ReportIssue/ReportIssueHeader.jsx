function ReportIssueHeader({ navigate }) {
  return (
    <div className="report_issue_header">
      <button
        className="report_issue_back"
        onClick={() => navigate('/profile/help-support')}
      >
        ‹
      </button>

      <h1>Report an Issue</h1>
    </div>
  );
}

export default ReportIssueHeader;
