import './OwnerShopSkeleton.css';

function SkeletonLine({ className = '' }) {
  return (
    <span
      className={`owner_shop_skeleton_line ${className}`}
      aria-hidden="true"
    />
  );
}

function OwnerShopSkeleton() {
  return (
    <main
      className="owner_shop_page owner_shop_skeleton_page"
      aria-busy="true"
      aria-label="Loading your shop"
    >
      {/* Header */}
      <section className="owner_shop_header owner_shop_skeleton_header">
        <div className="owner_shop_header_content">
          <SkeletonLine className="skeleton_status" />
          <SkeletonLine className="skeleton_heading" />
          <SkeletonLine className="skeleton_shop_id" />
          <SkeletonLine className="skeleton_description" />
          <SkeletonLine className="skeleton_description_short" />
        </div>
      </section>

      {/* Shop overview */}
      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div className="owner_shop_skeleton_section_heading">
            <SkeletonLine className="skeleton_section_title" />
            <SkeletonLine className="skeleton_section_subtitle" />
          </div>
        </div>

        <div className="owner_shop_overview_grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="owner_shop_overview_card" key={item}>
              <SkeletonLine className="skeleton_overview_icon" />

              <div className="skeleton_overview_content">
                <SkeletonLine className="skeleton_overview_label" />
                <SkeletonLine className="skeleton_overview_value" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer-facing shop */}
      <section className="owner_shop_customer_card owner_shop_skeleton_customer">
        <SkeletonLine className="skeleton_customer_icon" />

        <div className="owner_shop_customer_content">
          <SkeletonLine className="skeleton_customer_title" />
          <SkeletonLine className="skeleton_customer_description" />
        </div>

        <SkeletonLine className="skeleton_customer_button" />
      </section>

      {/* Services */}
      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div className="owner_shop_skeleton_section_heading">
            <SkeletonLine className="skeleton_section_title" />
            <SkeletonLine className="skeleton_section_subtitle" />
          </div>
        </div>

        <div className="owner_shop_services">
          {[1, 2, 3].map((item) => (
            <div className="owner_shop_service" key={item}>
              <SkeletonLine className="skeleton_service_icon" />

              <div className="skeleton_service_content">
                <SkeletonLine className="skeleton_service_title" />
                <SkeletonLine className="skeleton_service_description" />
              </div>

              <SkeletonLine className="skeleton_service_status" />
            </div>
          ))}
        </div>
      </section>

      {/* Address */}
      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div className="owner_shop_skeleton_section_heading">
            <SkeletonLine className="skeleton_section_title" />
            <SkeletonLine className="skeleton_section_subtitle" />
          </div>
        </div>

        <div className="owner_shop_address_card">
          <SkeletonLine className="skeleton_address_icon" />

          <div className="skeleton_address_content">
            <SkeletonLine className="skeleton_address_title" />
            <SkeletonLine className="skeleton_address_line" />
            <SkeletonLine className="skeleton_address_line_short" />
            <SkeletonLine className="skeleton_address_meta" />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div className="owner_shop_skeleton_section_heading">
            <SkeletonLine className="skeleton_section_title" />
            <SkeletonLine className="skeleton_section_subtitle" />
          </div>

          <SkeletonLine className="skeleton_products_action" />
        </div>

        <div className="owner_shop_products">
          {[1, 2, 3, 4].map((item) => (
            <div className="owner_shop_product_card" key={item}>
              <SkeletonLine className="skeleton_product_image" />

              <div className="skeleton_product_content">
                <SkeletonLine className="skeleton_product_title" />
                <SkeletonLine className="skeleton_product_category" />
                <SkeletonLine className="skeleton_product_price" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default OwnerShopSkeleton;