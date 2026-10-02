function ApplicationSubmit({
  application,
  canSubmit,
  submitting,
  error,
  missingFields,
  onSubmit,
}) {
  if (application?.applicationStatus === 'UNDER_REVIEW') {
    return (
      <section className="application_submit_card application_submit_review">
        <div className="application_submit_icon">✓</div>

        <h2>Application Under Review</h2>

        <p>
          Your application has been submitted successfully. RMA will review your
          details and documents.
        </p>
      </section>
    );
  }

  if (application?.applicationStatus === 'APPROVED') {
    return (
      <section className="application_submit_card application_submit_approved">
        <div className="application_submit_icon">✓</div>

        <h2>Application Approved</h2>

        <p>Your RMA Delivery Partner application has been approved.</p>
      </section>
    );
  }

  return (
    <section className="application_submit_card">
      <div className="application_submit_header">
        <h2>Submit Application</h2>

        <p>
          Make sure all your details and documents are correct before
          submitting.
        </p>
      </div>

      {application?.applicationStatus === 'CORRECTION_REQUIRED' && (
        <div className="application_submit_correction">
          <strong>Changes Required</strong>

          <p>
            {application.correctionReason ||
              'Please update the required information and submit again.'}
          </p>
        </div>
      )}

      {error && (
        <div className="application_submit_error">
          <strong>{error}</strong>

          {missingFields.length > 0 && (
            <ul>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        className="application_submit_primary"
        onClick={onSubmit}
        disabled={!canSubmit || submitting}
      >
        {submitting ? 'Submitting Application...' : 'Submit Application'}
      </button>

      {!canSubmit && !submitting && (
        <p className="application_submit_hint">
          Please complete all application sections before submitting.
        </p>
      )}
    </section>
  );
}

export default ApplicationSubmit;
