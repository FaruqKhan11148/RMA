import './DeliveryPartnersSkeleton.css';

function DeliveryPartnersSkeleton() {
  return (
    <div
      className="delivery_partners_skeleton"
      aria-label="Loading delivery partners"
    >
      {[1, 2, 3].map((item) => (
        <div className="delivery_partner_skeleton_card" key={item}>
          <span className="delivery_skeleton_radio" />

          <div className="delivery_skeleton_details">
            <span className="delivery_skeleton_line delivery_skeleton_name" />
            <span className="delivery_skeleton_line delivery_skeleton_phone" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DeliveryPartnersSkeleton;
