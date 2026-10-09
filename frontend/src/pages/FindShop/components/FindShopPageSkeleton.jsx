import '../FindShop.css';

function FindShopPageSkeleton() {
  return (
    <main className="find_shop">
      <div
        className="find_shop_content find_shop_page_skeleton"
        role="status"
        aria-label="Loading Find Shop page"
        aria-busy="true"
      >
        {/* Page header */}
        <section className="find_shop_header">
          <SkeletonLine className="page_skeleton_eyebrow" />
          <SkeletonLine className="page_skeleton_heading" />
          <SkeletonLine className="page_skeleton_subtitle" />
        </section>

        {/* Location */}
        <div className="page_skeleton_location">
          <div className="page_skeleton_location_text">
            <SkeletonLine className="page_skeleton_small" />
            <SkeletonLine className="page_skeleton_location_name" />
          </div>
          <SkeletonLine className="page_skeleton_change" />
        </div>

        {/* Nearby shops */}
        <section className="find_shop_nearby">
          <div className="find_shop_section_header">
            <div className="page_skeleton_section_heading">
              <SkeletonLine className="page_skeleton_small" />
              <SkeletonLine className="page_skeleton_subheading" />
              <SkeletonLine className="page_skeleton_subtitle" />
            </div>
            <SkeletonLine className="page_skeleton_distance" />
          </div>

          <div className="find_shop_nearby_list find_shop_nearby_skeleton_list">
            {[1, 2, 3].map((item) => (
              <div
                className="find_shop_nearby_card find_shop_nearby_skeleton_card"
                key={item}
                aria-hidden="true"
              >
                <SkeletonLine className="page_skeleton_shop_image" />

                <div className="page_skeleton_shop_title_row">
                  <SkeletonLine className="page_skeleton_shop_title" />
                  <SkeletonLine className="page_skeleton_rating" />
                </div>

                <SkeletonLine className="page_skeleton_description" />

                <div className="page_skeleton_shop_meta">
                  <SkeletonLine className="page_skeleton_meta_item" />
                  <SkeletonLine className="page_skeleton_meta_item" />
                  <SkeletonLine className="page_skeleton_meta_item" />
                </div>

                <div className="page_skeleton_shop_footer">
                  <SkeletonLine className="page_skeleton_shop_id" />
                  <SkeletonLine className="page_skeleton_view_shop" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shop ID search */}
        <section className="page_skeleton_section">
          <SkeletonLine className="page_skeleton_small" />
          <SkeletonLine className="page_skeleton_subheading" />
          <SkeletonLine className="page_skeleton_input" />
          <SkeletonLine className="page_skeleton_button" />
        </section>

        {/* QR section */}
        <section className="page_skeleton_qr">
          <SkeletonLine className="page_skeleton_qr_icon" />
          <div className="page_skeleton_qr_text">
            <SkeletonLine className="page_skeleton_subheading" />
            <SkeletonLine className="page_skeleton_subtitle" />
          </div>
          <SkeletonLine className="page_skeleton_qr_button" />
        </section>

        {/* Saved shop */}
        <section className="page_skeleton_saved_shop">
          <SkeletonLine className="page_skeleton_small" />
          <SkeletonLine className="page_skeleton_subheading" />
          <SkeletonLine className="page_skeleton_input" />
        </section>
      </div>
    </main>
  );
}

function SkeletonLine({ className = '' }) {
  return (
    <span className={`page_skeleton_block ${className}`} aria-hidden="true" />
  );
}

export default FindShopPageSkeleton;
