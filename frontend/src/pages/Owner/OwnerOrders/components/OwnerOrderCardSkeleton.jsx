import './OwnerOrderCardSkeleton.css';

function OwnerOrderCardSkeleton() {
  return (
    <div
      className="owner_order_card owner_order_card_skeleton"
      aria-hidden="true"
    >
      {/* Order ID and status */}
      <div className="owner_order_top">
        <span className="owner_skeleton_line skeleton_order_id" />
        <span className="owner_skeleton_block skeleton_status" />
      </div>

      {/* Customer */}
      <div className="owner_order_customer">
        <span className="owner_skeleton_line skeleton_customer_name" />
        <span className="owner_skeleton_line skeleton_customer_phone" />
      </div>

      {/* Payment summary */}
      <div className="owner_order_payment_summary">
        {[1, 2, 3].map((item) => (
          <div className="owner_order_payment_row" key={item}>
            <span className="owner_skeleton_line skeleton_payment_label" />
            <span className="owner_skeleton_line skeleton_payment_value" />
          </div>
        ))}
      </div>

      {/* Item count and total */}
      <div className="owner_order_summary">
        {[1, 2].map((item) => (
          <div key={item}>
            <span className="owner_skeleton_line skeleton_summary_label" />
            <span className="owner_skeleton_line skeleton_summary_value" />
          </div>
        ))}
      </div>

      {/* Order items */}
      <div className="owner_order_items_preview">
        <span className="owner_skeleton_line skeleton_items_heading" />

        {[1, 2].map((item) => (
          <div className="owner_order_item_preview" key={item}>
            <span className="owner_skeleton_line skeleton_item_name" />
            <span className="owner_skeleton_line skeleton_item_price" />
          </div>
        ))}
      </div>

      {/* Delivery or pickup metadata */}
      <div className="owner_order_meta">
        <span className="owner_skeleton_block skeleton_meta_badge" />
        <span className="owner_skeleton_block skeleton_distance_badge" />
      </div>

      {/* Delivery partner status */}
      <div className="owner_order_delivery_partner">
        <div className="owner_order_delivery_partner_info">
          <span className="owner_skeleton_line skeleton_partner_title" />
          <span className="owner_skeleton_line skeleton_partner_description" />
        </div>
        <span className="owner_skeleton_line skeleton_partner_status" />
      </div>

      {/* Action buttons */}
      <div className="owner_order_card_footer">
        <span className="owner_skeleton_block skeleton_action_button" />
        <span className="owner_skeleton_block skeleton_action_button" />
        <span className="owner_skeleton_block skeleton_view_button" />
      </div>
    </div>
  );
}

export default OwnerOrderCardSkeleton;
