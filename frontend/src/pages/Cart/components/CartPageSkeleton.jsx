import '../Cart.css';

function CartPageSkeleton() {
  return (
    <main
      className="cart cart_page_skeleton"
      role="status"
      aria-label="Loading cart"
      aria-busy="true"
    >
      {/* Header */}
      <div className="cart_skeleton_header">
        <SkeletonBlock className="cart_skeleton_back" />

        <div className="cart_skeleton_header_text">
          <SkeletonBlock className="cart_skeleton_heading" />
          <SkeletonBlock className="cart_skeleton_subtitle" />
        </div>
      </div>

      {/* Shop information */}
      <section className="cart_skeleton_shop">
        <SkeletonBlock className="cart_skeleton_shop_icon" />

        <div className="cart_skeleton_shop_text">
          <SkeletonBlock className="cart_skeleton_shop_name" />
          <SkeletonBlock className="cart_skeleton_shop_id" />
        </div>
      </section>

      {/* Cart items */}
      <section className="cart_skeleton_items" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <div className="cart_skeleton_item" key={item}>
            <SkeletonBlock className="cart_skeleton_product_image" />

            <div className="cart_skeleton_product_details">
              <SkeletonBlock className="cart_skeleton_product_name" />
              <SkeletonBlock className="cart_skeleton_product_info" />
              <SkeletonBlock className="cart_skeleton_product_price" />

              <div className="cart_skeleton_product_bottom">
                <SkeletonBlock className="cart_skeleton_quantity" />
                <SkeletonBlock className="cart_skeleton_remove" />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Summary */}
      <section className="cart_skeleton_summary">
        <SkeletonBlock className="cart_skeleton_summary_heading" />

        <div className="cart_skeleton_summary_row">
          <SkeletonBlock className="cart_skeleton_summary_label" />
          <SkeletonBlock className="cart_skeleton_summary_value" />
        </div>

        <div className="cart_skeleton_summary_row">
          <SkeletonBlock className="cart_skeleton_summary_label" />
          <SkeletonBlock className="cart_skeleton_summary_value" />
        </div>

        <SkeletonBlock className="cart_skeleton_checkout" />
      </section>
    </main>
  );
}

function SkeletonBlock({ className = '' }) {
  return (
    <span className={`cart_skeleton_block ${className}`} aria-hidden="true" />
  );
}

export default CartPageSkeleton;
