function ReportIssueError({ error }) {
  if (!error) {
    return null;
  }

  return <div className="report_issue_error">{error}</div>;
}

export default ReportIssueError;
