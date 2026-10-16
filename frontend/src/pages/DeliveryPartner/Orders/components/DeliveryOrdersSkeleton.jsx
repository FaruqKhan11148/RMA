import './DeliveryOrdersSkeleton.css';

function SkeletonBlock({ className = '' }) {
  return <div className={`delivery_orders_skeleton_block ${className}`} />;
}

function DeliveryOrdersSkeleton({ variant = 'all' }) {
  const showTabs = variant === 'all' || variant === 'tabs';
  const showOrders = variant === 'all' || variant === 'orders';

  return (
    <div
      className="delivery_orders_skeleton"
      role="status"
      aria-label="Loading delivery orders"
    >
      {showTabs && (
        <div className="delivery_tabs_skeleton">
          {[1, 2, 3, 4].map((item) => (
            <div className="delivery_tab_skeleton" key={item}>
              <SkeletonBlock className="delivery_tab_label_skeleton" />
              <SkeletonBlock className="delivery_tab_count_skeleton" />
            </div>
          ))}
        </div>
      )}

      {showOrders && (
        <div className="delivery_order_list_skeleton">
          <SkeletonBlock className="delivery_order_heading_skeleton" />

          {[1, 2, 3].map((item) => (
            <article className="delivery_order_card_skeleton" key={item}>
              <div className="delivery_order_top_skeleton">
                <SkeletonBlock className="delivery_order_id_skeleton" />
                <SkeletonBlock className="delivery_order_status_skeleton" />
              </div>

              <div className="delivery_order_info_skeleton">
                <SkeletonBlock className="delivery_customer_name_skeleton" />
                <SkeletonBlock className="delivery_customer_info_skeleton" />
                <SkeletonBlock className="delivery_customer_address_skeleton" />
              </div>

              <div className="delivery_order_items_skeleton">
                <SkeletonBlock className="delivery_item_line_skeleton" />
                <SkeletonBlock className="delivery_item_line_skeleton short" />
              </div>

              <div className="delivery_order_footer_skeleton">
                <SkeletonBlock className="delivery_order_total_skeleton" />
                <SkeletonBlock className="delivery_order_button_skeleton" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeliveryOrdersSkeleton;
