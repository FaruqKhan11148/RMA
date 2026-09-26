function DeliveryPartnerCard({ partner, onApprove, onReject }) {
  return (
    <div className="admin_delivery_partner_card">
      <div className="admin_partner_card_top">
        <div className="admin_partner_avatar">
          {partner.name?.charAt(0).toUpperCase()}
        </div>

        <div className="admin_partner_identity">
          <h3>{partner.name}</h3>
          <span>RMA Delivery Partner</span>
        </div>

        <div className="admin_pending_badge">Pending</div>
      </div>

      <div className="admin_partner_details">
        <div className="admin_partner_detail">
          <span className="admin_detail_label">Phone</span>
          <span className="admin_detail_value">{partner.phone}</span>
        </div>

        <div className="admin_partner_detail">
          <span className="admin_detail_label">Applied On</span>
          <span className="admin_detail_value">
            {new Date(partner.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="admin_partner_actions">
        <button
          type="button"
          className="admin_reject_button"
          onClick={() => onReject(partner.id)}
        >
          Reject
        </button>

        <button
          type="button"
          className="admin_approve_button"
          onClick={() => onApprove(partner.id)}
        >
          Approve
        </button>
      </div>
    </div>
  );
}

export default DeliveryPartnerCard;
