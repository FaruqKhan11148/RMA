function DeliveryPartnersHeader({ count }) {
  return (
    <div className="admin_delivery_partners_header">
      <div>
        <h1>Delivery Partners</h1>
        <p>Review and manage RMA delivery partner applications.</p>
      </div>

      <div className="admin_delivery_partners_count">{count} Pending</div>
    </div>
  );
}

export default DeliveryPartnersHeader;
