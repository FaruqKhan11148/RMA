function ApplicationHeader({ application }) {
  const status = application?.applicationStatus || 'INCOMPLETE';

  const statusText = {
    INCOMPLETE: 'Application Incomplete',
    SUBMITTED: 'Application Submitted',
    UNDER_REVIEW: 'Under Review',
    CORRECTION_REQUIRED: 'Corrections Required',
    APPROVED: 'Application Approved',
    REJECTED: 'Application Rejected',
  };

  return (
    <div className="delivery_application_header">
      <div>
        <span className="delivery_application_eyebrow">
          RMA Delivery Partner
        </span>

        <h1>Complete Your Application</h1>

        <p>
          Complete your profile and required documents to start delivering with
          RMA.
        </p>
      </div>

      <div
        className={`delivery_application_status delivery_application_status_${status.toLowerCase()}`}
      >
        {statusText[status] || status}
      </div>
    </div>
  );
}

export default ApplicationHeader;
