function DeliveryPartnerCard({ partner, onReview }) {
  const applicationStatus = partner.applicationStatus || 'INCOMPLETE';

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/_/g, '-');
  };

  return (
    <div className="admin_delivery_partner_card">
      <div className="admin_partner_card_top">
        <div className="admin_partner_avatar">
          {partner.name ? partner.name.charAt(0).toUpperCase() : '?'}
        </div>

        <div className="admin_partner_identity">
          <h3>{partner.name || 'Name not provided'}</h3>

          <span>RMA Delivery Partner</span>
        </div>

        <div
          className={`admin_pending_badge admin_partner_status_${getStatusClass(
            applicationStatus,
          )}`}
        >
          {applicationStatus.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="admin_partner_details">
        <div className="admin_partner_detail">
          <span className="admin_detail_label">Phone</span>

          <span className="admin_detail_value">
            {partner.phone || 'Not provided'}
          </span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">Created</span>

          <span className="admin_detail_value">
            {partner.createdAt
              ? new Date(partner.createdAt).toLocaleString()
              : 'Not available'}
          </span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">KYC</span>

          <span className="admin_detail_value">
            {partner.kyc?.status || 'NOT_SUBMITTED'}
          </span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">Driving Licence</span>

          <span className="admin_detail_value">
            {partner.drivingLicence?.status || 'NOT_SUBMITTED'}
          </span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">Vehicle</span>

          <span className="admin_detail_value">
            {partner.vehicle?.status || 'NOT_SUBMITTED'}
          </span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">Bank</span>

          <span className="admin_detail_value">
            {partner.bankAccount?.status || 'NOT_SUBMITTED'}
          </span>
        </div>
      </div>

      <div className="admin_partner_actions">
        <button
          type="button"
          className="admin_review_button"
          onClick={() => onReview(partner.id)}
        >
          View Application
        </button>
      </div>
    </div>
  );
}

export default DeliveryPartnerCard;
