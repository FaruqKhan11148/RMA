import { useEffect, useState } from 'react';
import './DeliveryPartnerReview.css';

import {
  verifyPartnerKyc,
  rejectPartnerKyc,
  verifyPartnerDrivingLicence,
  rejectPartnerDrivingLicence,
  verifyPartnerVehicle,
  rejectPartnerVehicle,
  verifyPartnerBank,
  rejectPartnerBank,
  fetchPartnerApplication,
} from '../utils/deliveryPartnerApi';

function DeliveryPartnerReview({
  partner,
  loading,
  error,
  onBack,
  onApprove,
  onRequestCorrection,
  onReject,
}) {
  const [kycActionLoading, setKycActionLoading] = useState(false);
  const [kycActionError, setKycActionError] = useState('');
  const [dlActionLoading, setDlActionLoading] = useState(false);
  const [dlActionError, setDlActionError] = useState('');
  const [vehicleActionLoading, setVehicleActionLoading] = useState(false);
  const [vehicleActionError, setVehicleActionError] = useState('');
  const [bankActionLoading, setBankActionLoading] = useState(false);
  const [bankActionError, setBankActionError] = useState('');

  const [reviewPartner, setReviewPartner] = useState(partner || null);

  useEffect(() => {
    setReviewPartner(partner);
  }, [partner]);

  const handleVerifyKyc = async () => {
    try {
      setKycActionLoading(true);
      setKycActionError('');

      await verifyPartnerKyc(partner.id);

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to verify KYC:', error);

      setKycActionError(error.message || 'Failed to verify KYC');
    } finally {
      setKycActionLoading(false);
    }
  };

  const handleRejectKyc = async () => {
    const reason = window.prompt('Enter the reason for rejecting this KYC:');

    if (!reason?.trim()) {
      return;
    }

    try {
      setKycActionLoading(true);
      setKycActionError('');

      await rejectPartnerKyc(partner.id, reason.trim());

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to reject KYC:', error);

      setKycActionError(error.message || 'Failed to reject KYC');
    } finally {
      setKycActionLoading(false);
    }
  };

  const handleVerifyDrivingLicence = async () => {
    try {
      setDlActionLoading(true);
      setDlActionError('');

      await verifyPartnerDrivingLicence(partner.id);

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to verify driving licence:', error);

      setDlActionError(error.message || 'Failed to verify driving licence');
    } finally {
      setDlActionLoading(false);
    }
  };

  const handleRejectDrivingLicence = async () => {
    const reason = window.prompt(
      'Enter the reason for rejecting this driving licence:',
    );

    if (!reason?.trim()) {
      return;
    }

    try {
      setDlActionLoading(true);
      setDlActionError('');

      await rejectPartnerDrivingLicence(partner.id, reason.trim());

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to reject driving licence:', error);

      setDlActionError(error.message || 'Failed to reject driving licence');
    } finally {
      setDlActionLoading(false);
    }
  };

  const handleVerifyVehicle = async () => {
    try {
      setVehicleActionLoading(true);
      setVehicleActionError('');

      await verifyPartnerVehicle(partner.id);

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to verify vehicle:', error);

      setVehicleActionError(error.message || 'Failed to verify vehicle');
    } finally {
      setVehicleActionLoading(false);
    }
  };

  const handleRejectVehicle = async () => {
    const reason = window.prompt(
      'Enter the reason for rejecting this vehicle:',
    );

    if (!reason?.trim()) return;

    try {
      setVehicleActionLoading(true);
      setVehicleActionError('');

      await rejectPartnerVehicle(partner.id, reason.trim());

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to reject vehicle:', error);

      setVehicleActionError(error.message || 'Failed to reject vehicle');
    } finally {
      setVehicleActionLoading(false);
    }
  };

  const handleVerifyBank = async () => {
    try {
      setBankActionLoading(true);
      setBankActionError('');

      await verifyPartnerBank(partner.id);

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to verify bank account:', error);

      setBankActionError(error.message || 'Failed to verify bank account');
    } finally {
      setBankActionLoading(false);
    }
  };

  const handleRejectBank = async () => {
    const reason = window.prompt(
      'Enter the reason for rejecting this bank account:',
    );

    if (!reason?.trim()) return;

    try {
      setBankActionLoading(true);
      setBankActionError('');

      await rejectPartnerBank(partner.id, reason.trim());

      const updatedPartner = await fetchPartnerApplication(partner.id);

      setReviewPartner(updatedPartner);
    } catch (error) {
      console.error('Failed to reject bank account:', error);

      setBankActionError(error.message || 'Failed to reject bank account');
    } finally {
      setBankActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin_delivery_partner_review">
        <div className="admin_review_loading">Loading application...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin_delivery_partner_review">
        <button
          type="button"
          className="admin_review_back_button"
          onClick={onBack}
        >
          ← Back to Applications
        </button>

        <div className="admin_review_error">
          <h2>Unable to load application</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="admin_delivery_partner_review">
      <button
        type="button"
        className="admin_review_back_button"
        onClick={onBack}
      >
        ← Back to Applications
      </button>

      <div className="admin_review_header">
        <div className="admin_review_identity">
          <div className="admin_review_avatar">
            {partner.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <span className="admin_review_eyebrow">RMA Delivery Partner</span>

            <h1>{partner.name}</h1>

            <p>{partner.phone}</p>
          </div>
        </div>

        <div className="admin_review_status">{partner.applicationStatus}</div>
      </div>

      <div className="admin_review_sections">
        {/* =========================
            PERSONAL DETAILS
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>01</span>
              <h2>Personal Details</h2>
            </div>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail">
              <span>Name</span>
              <strong>{partner.name || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>Phone</span>
              <strong>{partner.phone || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>Date of Birth</span>
              <strong>
                {partner.profile?.dateOfBirth
                  ? new Date(partner.profile.dateOfBirth).toLocaleDateString()
                  : 'Not provided'}
              </strong>
            </div>
          </div>

          {partner.profile?.profilePhotoUrl && (
            <div className="admin_review_photo_block">
              <span>Profile Photo</span>

              <img
                src={partner.profile.profilePhotoUrl}
                alt={`${partner.name || 'Partner'} profile`}
              />
            </div>
          )}
        </section>

        {/* =========================
            ADDRESS
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>02</span>
              <h2>Address</h2>
            </div>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail admin_review_detail_full">
              <span>Address</span>
              <strong>{partner.address?.addressLine || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>City</span>
              <strong>{partner.address?.city || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>State</span>
              <strong>{partner.address?.state || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>Pincode</span>
              <strong>{partner.address?.pincode || 'Not provided'}</strong>
            </div>
          </div>
        </section>

        {/* =========================
            KYC
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>03</span>
              <h2>KYC Verification</h2>
            </div>

            <span
              className={`admin_document_status admin_document_status_${(
                partner.kyc?.status || 'NOT_SUBMITTED'
              ).toLowerCase()}`}
            >
              {partner.kyc?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail">
              <span>Document Type</span>
              <strong>{partner.kyc?.documentType || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>Document Number</span>
              <strong>{partner.kyc?.documentNumber || 'Not provided'}</strong>
            </div>
          </div>

          <div className="admin_review_documents">
            {partner.kyc?.frontImageUrl && (
              <div className="admin_review_document">
                <span>Front</span>
                <img src={partner.kyc.frontImageUrl} alt="KYC document front" />
              </div>
            )}

            {partner.kyc?.backImageUrl && (
              <div className="admin_review_document">
                <span>Back</span>
                <img src={partner.kyc.backImageUrl} alt="KYC document back" />
              </div>
            )}

            {partner.kyc?.selfieImageUrl && (
              <div className="admin_review_document">
                <span>Selfie</span>
                <img src={partner.kyc.selfieImageUrl} alt="KYC selfie" />
              </div>
            )}
          </div>

          {partner.kyc?.status !== 'VERIFIED' && (
            <div className="admin_kyc_actions">
              <button
                type="button"
                className="admin_kyc_verify_button"
                onClick={handleVerifyKyc}
                disabled={kycActionLoading}
              >
                {kycActionLoading ? 'Verifying...' : 'Verify KYC'}
              </button>

              <button
                type="button"
                className="admin_kyc_reject_button"
                onClick={handleRejectKyc}
                disabled={kycActionLoading}
              >
                Reject KYC
              </button>
            </div>
          )}

          {kycActionError && (
            <div className="admin_kyc_action_error">{kycActionError}</div>
          )}

          {partner.kyc?.status === 'REJECTED' &&
            partner.kyc?.rejectionReason && (
              <div className="admin_kyc_rejection_reason">
                <strong>KYC Rejection Reason</strong>
                <p>{partner.kyc.rejectionReason}</p>
              </div>
            )}
        </section>

        {/* =========================
            DRIVING LICENCE
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>04</span>
              <h2>Driving Licence</h2>
            </div>

            <span
              className={`admin_document_status admin_document_status_${(
                partner.drivingLicence?.status || 'NOT_SUBMITTED'
              ).toLowerCase()}`}
            >
              {partner.drivingLicence?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail">
              <span>Licence Number</span>
              <strong>
                {partner.drivingLicence?.number || 'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>Expiry Date</span>
              <strong>
                {partner.drivingLicence?.expiryDate
                  ? new Date(
                      partner.drivingLicence.expiryDate,
                    ).toLocaleDateString()
                  : 'Not provided'}
              </strong>
            </div>
          </div>

          <div className="admin_review_documents">
            {partner.drivingLicence?.frontImageUrl && (
              <div className="admin_review_document">
                <span>Front</span>
                <img
                  src={partner.drivingLicence.frontImageUrl}
                  alt="Driving licence front"
                />
              </div>
            )}

            {partner.drivingLicence?.backImageUrl && (
              <div className="admin_review_document">
                <span>Back</span>
                <img
                  src={partner.drivingLicence.backImageUrl}
                  alt="Driving licence back"
                />
              </div>
            )}
          </div>
          {reviewPartner?.drivingLicence?.status !== 'VERIFIED' && (
            <div className="admin_kyc_actions">
              <button
                type="button"
                className="admin_kyc_verify_button"
                onClick={handleVerifyDrivingLicence}
                disabled={dlActionLoading}
              >
                {dlActionLoading ? 'Verifying...' : 'Verify Driving Licence'}
              </button>

              <button
                type="button"
                className="admin_kyc_reject_button"
                onClick={handleRejectDrivingLicence}
                disabled={dlActionLoading}
              >
                Reject Driving Licence
              </button>
            </div>
          )}

          {dlActionError && (
            <div className="admin_kyc_action_error">{dlActionError}</div>
          )}

          {reviewPartner?.drivingLicence?.status === 'REJECTED' &&
            reviewPartner.drivingLicence?.rejectionReason && (
              <div className="admin_kyc_rejection_reason">
                <strong>Driving Licence Rejection Reason</strong>
                <p>{reviewPartner.drivingLicence.rejectionReason}</p>
              </div>
            )}
        </section>

        {/* =========================
            VEHICLE
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>05</span>
              <h2>Vehicle</h2>
            </div>

            <span
              className={`admin_document_status admin_document_status_${(
                reviewPartner?.vehicle?.status || 'NOT_SUBMITTED'
              ).toLowerCase()}`}
            >
              {reviewPartner?.vehicle?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail">
              <span>Vehicle Type</span>
              <strong>{reviewPartner?.vehicle?.type || 'Not provided'}</strong>
            </div>

            <div className="admin_review_detail">
              <span>Registration Number</span>
              <strong>
                {reviewPartner?.vehicle?.registrationNumber || 'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>Insurance Expiry</span>
              <strong>
                {reviewPartner?.vehicle?.insuranceExpiry
                  ? new Date(
                      reviewPartner.vehicle.insuranceExpiry,
                    ).toLocaleDateString()
                  : 'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>PUC Expiry</span>
              <strong>
                {reviewPartner?.vehicle?.pucExpiry
                  ? new Date(
                      reviewPartner.vehicle.pucExpiry,
                    ).toLocaleDateString()
                  : 'Not provided'}
              </strong>
            </div>
          </div>

          <div className="admin_review_documents">
            {reviewPartner?.vehicle?.rcImageUrl && (
              <div className="admin_review_document">
                <span>RC Document</span>
                <img
                  src={reviewPartner.vehicle.rcImageUrl}
                  alt="Vehicle RC document"
                />
              </div>
            )}

            {reviewPartner?.vehicle?.insuranceImageUrl && (
              <div className="admin_review_document">
                <span>Insurance Document</span>
                <img
                  src={reviewPartner.vehicle.insuranceImageUrl}
                  alt="Vehicle insurance document"
                />
              </div>
            )}

            {reviewPartner?.vehicle?.pucImageUrl && (
              <div className="admin_review_document">
                <span>PUC Document</span>
                <img
                  src={reviewPartner.vehicle.pucImageUrl}
                  alt="Vehicle PUC document"
                />
              </div>
            )}
          </div>

          {reviewPartner?.vehicle?.status !== 'VERIFIED' && (
            <div className="admin_kyc_actions">
              <button
                type="button"
                className="admin_kyc_verify_button"
                onClick={handleVerifyVehicle}
                disabled={vehicleActionLoading}
              >
                {vehicleActionLoading ? 'Verifying...' : 'Verify Vehicle'}
              </button>

              <button
                type="button"
                className="admin_kyc_reject_button"
                onClick={handleRejectVehicle}
                disabled={vehicleActionLoading}
              >
                Reject Vehicle
              </button>
            </div>
          )}

          {vehicleActionError && (
            <div className="admin_kyc_action_error">{vehicleActionError}</div>
          )}

          {reviewPartner?.vehicle?.status === 'REJECTED' &&
            reviewPartner?.vehicle?.rejectionReason && (
              <div className="admin_kyc_rejection_reason">
                <strong>Vehicle Rejection Reason</strong>

                <p>{reviewPartner.vehicle.rejectionReason}</p>
              </div>
            )}
        </section>

        {/* =========================
            BANK ACCOUNT
        ========================= */}

        <section className="admin_review_section">
          <div className="admin_review_section_header">
            <div>
              <span>06</span>
              <h2>Bank Account</h2>
            </div>

            <span
              className={`admin_document_status admin_document_status_${(
                reviewPartner?.bankAccount?.status || 'NOT_SUBMITTED'
              ).toLowerCase()}`}
            >
              {reviewPartner?.bankAccount?.status || 'NOT SUBMITTED'}
            </span>
          </div>

          <div className="admin_review_details_grid">
            <div className="admin_review_detail">
              <span>Account Holder Name</span>
              <strong>
                {reviewPartner?.bankAccount?.accountHolderName ||
                  'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>Account Number</span>
              <strong>
                {reviewPartner?.bankAccount?.accountNumber || 'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>IFSC</span>
              <strong>
                {reviewPartner?.bankAccount?.ifsc || 'Not provided'}
              </strong>
            </div>

            <div className="admin_review_detail">
              <span>Bank Name</span>
              <strong>
                {reviewPartner?.bankAccount?.bankName || 'Not provided'}
              </strong>
            </div>
          </div>

          {reviewPartner?.bankAccount?.proofImageUrl && (
            <div className="admin_review_documents">
              <div className="admin_review_document">
                <span>Bank Proof</span>

                <img
                  src={reviewPartner.bankAccount.proofImageUrl}
                  alt="Bank account proof"
                />
              </div>
            </div>
          )}

          {reviewPartner?.bankAccount?.status !== 'VERIFIED' && (
            <div className="admin_kyc_actions">
              <button
                type="button"
                className="admin_kyc_verify_button"
                onClick={handleVerifyBank}
                disabled={bankActionLoading}
              >
                {bankActionLoading ? 'Verifying...' : 'Verify Bank Account'}
              </button>

              <button
                type="button"
                className="admin_kyc_reject_button"
                onClick={handleRejectBank}
                disabled={bankActionLoading}
              >
                Reject Bank Account
              </button>
            </div>
          )}

          {bankActionError && (
            <div className="admin_kyc_action_error">{bankActionError}</div>
          )}

          {reviewPartner?.bankAccount?.status === 'REJECTED' &&
            reviewPartner?.bankAccount?.rejectionReason && (
              <div className="admin_kyc_rejection_reason">
                <strong>Bank Account Rejection Reason</strong>

                <p>{reviewPartner.bankAccount.rejectionReason}</p>
              </div>
            )}
        </section>
      </div>

      {/* =========================
          ADMIN ACTIONS
      ========================= */}

      <div className="admin_review_actions">
        <button
          type="button"
          className="admin_review_action_secondary"
          onClick={onReject}
        >
          Reject Application
        </button>

        <button
          type="button"
          className="admin_review_action_warning"
          onClick={onRequestCorrection}
        >
          Request Changes
        </button>

        <button
          type="button"
          className="admin_review_action_primary"
          onClick={onApprove}
        >
          Approve Application
        </button>
      </div>
    </div>
  );
}

export default DeliveryPartnerReview;
