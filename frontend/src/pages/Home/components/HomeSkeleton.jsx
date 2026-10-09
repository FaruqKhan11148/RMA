import './HomeSkeleton.css';

export function SkeletonBlock({ className = '' }) {
  return (
    <span className={`home-skeleton ${className}`.trim()} aria-hidden="true" />
  );
}

export function NearbyShopSkeletons() {
  return (
    <div
      className="nearby_shops_list home_skeleton_list"
      role="status"
      aria-label="Loading nearby shops"
    >
      {[0, 1, 2].map((item) => (
        <div className="home_skeleton_shop_card" key={item}>
          {' '}
          <SkeletonBlock className="home_skeleton_shop_image" />
          <div className="home_skeleton_shop_content">
            <div className="home_skeleton_title_row">
              <SkeletonBlock className="home_skeleton_shop_title" />
              <SkeletonBlock className="home_skeleton_rating" />
            </div>

            <SkeletonBlock className="home_skeleton_description" />

            <div className="home_skeleton_meta">
              <SkeletonBlock className="home_skeleton_meta_item" />
              <SkeletonBlock className="home_skeleton_meta_item home_skeleton_meta_short" />
              <SkeletonBlock className="home_skeleton_meta_item home_skeleton_meta_short" />
            </div>
          </div>
        </div>
      ))}
      <span className="home_skeleton_sr_text">Loading nearby shops…</span>
    </div>
  );
}

export function PopularProductSkeletons() {
  return (
    <div
      className="popular_products_list home_skeleton_list"
      role="status"
      aria-label="Loading popular products"
    >
      {[0, 1, 2].map((item) => (
        <div className="home_skeleton_product_card" key={item}>
          {' '}
          <SkeletonBlock className="home_skeleton_product_image" />
          <div className="home_skeleton_product_content">
            <SkeletonBlock className="home_skeleton_product_title" />
            <SkeletonBlock className="home_skeleton_product_shop" />

            <div className="home_skeleton_product_bottom">
              <SkeletonBlock className="home_skeleton_product_price" />
              <SkeletonBlock className="home_skeleton_product_arrow" />
            </div>
          </div>
        </div>
      ))}
      <span className="home_skeleton_sr_text">Loading popular products…</span>
    </div>
  );
}

export function AddressSkeletons() {
  return (
    <div
      className="home_skeleton_address_list"
      role="status"
      aria-label="Loading saved addresses"
    >
      {[0, 1, 2].map((item) => (
        <div className="home_skeleton_address_row" key={item}>
          {' '}
          <SkeletonBlock className="home_skeleton_address_icon" />{' '}
          <div className="home_skeleton_address_content">
            {' '}
            <SkeletonBlock className="home_skeleton_address_title" />{' '}
            <SkeletonBlock className="home_skeleton_address_detail" />{' '}
          </div>{' '}
        </div>
      ))}{' '}
      <span className="home_skeleton_sr_text">
        Loading saved addresses…
      </span>{' '}
    </div>
  );
}
