import './DeliveryApplication.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ApplicationHeader from './components/ApplicationHeader';
import ApplicationProgress from './components/ApplicationProgress';
import ApplicationSectionCard from './components/ApplicationSectionCard';
import ApplicationSubmit from './components/ApplicationSubmit';
import RmaDeliveryAgreement from './components/RmaDeliveryAgreement';

import {
  fetchRmaApplication,
  submitRmaApplication,
  acceptRmaDeliveryAgreement,
} from './utils/applicationApi';

const RMA_AGREEMENT_VERSION = 'RMA-DP-1.0';

function DeliveryApplication() {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [missingFields, setMissingFields] = useState([]);

  const [showAgreement, setShowAgreement] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [agreementError, setAgreementError] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchRmaApplication();

        setApplication(data);
      } catch (loadError) {
        console.error('Failed to load RMA delivery application:', loadError);

        setError(loadError.message || 'Unable to load your application.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, []);

  const sections = useMemo(
    () => [
      {
        key: 'profile',
        number: 1,
        title: 'Personal Details',
        description: 'Date of birth and profile photo',
        completed:
          Boolean(application?.profile?.dateOfBirth) &&
          Boolean(application?.profile?.profilePhotoUrl),
        path: '/delivery-partner/application/profile',
      },

      {
        key: 'address',
        number: 2,
        title: 'Address',
        description: 'Your current residential address',
        completed:
          Boolean(application?.address?.addressLine) &&
          Boolean(application?.address?.city) &&
          Boolean(application?.address?.state) &&
          Boolean(application?.address?.pincode),
        path: '/delivery-partner/application/address',
      },

      {
        key: 'kyc',
        number: 3,
        title: 'KYC Verification',
        description: 'Identity document and verification photos',
        completed:
          Boolean(application?.kyc?.documentType) &&
          Boolean(application?.kyc?.documentNumber) &&
          Boolean(application?.kyc?.frontImageUrl) &&
          Boolean(application?.kyc?.backImageUrl) &&
          Boolean(application?.kyc?.selfieImageUrl),
        path: '/delivery-partner/application/kyc',
      },

      {
        key: 'drivingLicence',
        number: 4,
        title: 'Driving Licence',
        description: 'Licence details and document photos',
        completed:
          Boolean(application?.drivingLicence?.number) &&
          Boolean(application?.drivingLicence?.frontImageUrl) &&
          Boolean(application?.drivingLicence?.backImageUrl) &&
          Boolean(application?.drivingLicence?.expiryDate),
        path: '/delivery-partner/application/driving-licence',
      },

      {
        key: 'vehicle',
        number: 5,
        title: 'Vehicle',
        description: 'Vehicle and registration documents',
        completed:
          Boolean(application?.vehicle?.type) &&
          Boolean(application?.vehicle?.registrationNumber) &&
          Boolean(application?.vehicle?.rcImageUrl),
        path: '/delivery-partner/application/vehicle',
      },

      {
        key: 'bankAccount',
        number: 6,
        title: 'Bank Account & UPI',
        description: 'Bank details and UPI ID for receiving payments',
        completed:
          Boolean(application?.bankAccount?.accountHolderName) &&
          Boolean(application?.bankAccount?.accountNumber) &&
          Boolean(application?.bankAccount?.ifsc) &&
          Boolean(application?.bankAccount?.bankName) &&
          Boolean(application?.bankAccount?.proofImageUrl) &&
          Boolean(application?.bankAccount?.paymentUpiId?.trim()),
        path: '/delivery-partner/application/bank',
      },
    ],
    [application],
  );

  const allSectionsCompleted = sections.every((section) => section.completed);

  const agreementAccepted =
    application?.agreement?.accepted === true &&
    application?.agreement?.version === RMA_AGREEMENT_VERSION &&
    Boolean(application?.agreement?.acceptedAt);

  const handleAcceptAgreement = async () => {
    try {
      setAcceptingAgreement(true);
      setAgreementError('');

      await acceptRmaDeliveryAgreement();

      const updatedApplication = await fetchRmaApplication();
      setApplication(updatedApplication);

      if (
        updatedApplication?.agreement?.accepted === true &&
        updatedApplication?.agreement?.version === RMA_AGREEMENT_VERSION
      ) {
        setShowAgreement(false);
      } else {
        setAgreementError(
          'Acceptance could not be confirmed. Please reload and try again.',
        );
      }
    } catch (acceptError) {
      console.error('RMA agreement acceptance failed:', acceptError);
      setAgreementError(
        acceptError.message || 'Unable to save your agreement acceptance.',
      );
    } finally {
      setAcceptingAgreement(false);
    }
  };

  const handleOpenAgreement = () => {
    setAgreementError('');
    setShowAgreement(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');
      setMissingFields([]);

      await submitRmaApplication();

      const updatedApplication = await fetchRmaApplication();

      setApplication(updatedApplication);
    } catch (submitApplicationError) {
      console.error(
        'RMA delivery application submission failed:',
        submitApplicationError,
      );

      setSubmitError(
        submitApplicationError.message || 'Unable to submit your application.',
      );

      setMissingFields(submitApplicationError.missingFields || []);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="delivery_application_page">
        <div className="delivery_application_loading">
          Loading your application...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="delivery_application_page">
        <div className="delivery_application_error">
          <h2>Unable to load application</h2>

          <p>{error}</p>

          <button type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const applicationStatus = application?.applicationStatus;

  const isSubmitted =
    applicationStatus === 'SUBMITTED' || applicationStatus === 'UNDER_REVIEW';

  const isApproved = applicationStatus === 'APPROVED';

  const isCorrectionRequired = applicationStatus === 'CORRECTION_REQUIRED';

  const isRejected = applicationStatus === 'REJECTED';

  if (showAgreement && !isSubmitted && !isApproved && !isRejected) {
    return (
      <main className="delivery_application_page">
        <div className="delivery_application_container">
          <RmaDeliveryAgreement
            accepted={agreementAccepted}
            accepting={acceptingAgreement}
            error={agreementError}
            onAccept={handleAcceptAgreement}
            onBack={() => setShowAgreement(false)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="delivery_application_page">
      <div className="delivery_application_container">
        <button
          type="button"
          className="delivery_application_back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <ApplicationHeader application={application} />

        <ApplicationProgress application={application} />

        {submitError && (
          <div className="delivery_application_submit_error">{submitError}</div>
        )}

        <section className="delivery_application_sections">
          {sections.map((section) => (
            <ApplicationSectionCard
              key={section.key}
              number={section.number}
              title={section.title}
              description={section.description}
              completed={section.completed}
              status={section.completed ? 'Edit' : 'Complete'}
              onClick={() => navigate(section.path)}
            />
          ))}
        </section>

        {!isSubmitted &&
          !isApproved &&
          !isRejected &&
          !isCorrectionRequired && (
            <ApplicationSubmit
              application={application}
              canSubmit={allSectionsCompleted}
              submitting={submitting}
              error={submitError}
              missingFields={missingFields}
              onSubmit={handleSubmit}
              agreementAccepted={agreementAccepted}
              onReviewAgreement={handleOpenAgreement}
            />
          )}

        {isSubmitted && (
          <div className="delivery_application_review">
            <div className="delivery_application_review_icon">✓</div>

            <h2>Application Under Review</h2>

            <p>
              Your application has been submitted successfully. RMA will review
              your details and documents.
            </p>

            <button
              type="button"
              className="delivery_application_dashboard_button"
              onClick={() => navigate('/delivery/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {isCorrectionRequired && (
          <div className="delivery_application_review">
            <div className="delivery_application_review_icon">!</div>

            <h2>Changes Required</h2>

            <p>
              {application?.correctionReason ||
                'Please update the required information and submit your application again.'}
            </p>
          </div>
        )}

        {isRejected && (
          <div className="delivery_application_review">
            <div className="delivery_application_review_icon">!</div>

            <h2>Application Rejected</h2>

            <p>
              {application?.rejectionReason ||
                'Your RMA Delivery Partner application has been rejected.'}
            </p>
          </div>
        )}

        {isApproved && (
          <div className="delivery_application_review">
            <div className="delivery_application_review_icon">✓</div>

            <h2>Application Approved</h2>

            <p>Your RMA Delivery Partner application has been approved.</p>

            <p>
              Your RMA Delivery Partner dashboard will be available here once
              operational access is enabled.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default DeliveryApplication;
