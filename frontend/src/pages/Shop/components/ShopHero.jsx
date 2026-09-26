function ShopHero({ shop, onBack }) {
  return (
    <section className="shop_hero">
      <div className="shop_hero_top">
        <button
          type="button"
          className="shop_back_button"
          onClick={onBack}
          aria-label="Go back"
        >
          <span>←</span>
          <span>Back</span>
        </button>

        <span className="shop_hero_id">{shop.shopId}</span>
      </div>

      <div className="shop_hero_content">
        <div className="shop_status_row">
          <span
            className={
              shop.isOpen
                ? 'shop_status_badge shop_status_open'
                : 'shop_status_badge shop_status_closed'
            }
          >
            <span className="shop_status_dot" />

            {shop.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>

        <h1>{shop.shopName}</h1>

        <div className="shop_rating">
          <span className="shop_rating_star">★</span>

          <span className="shop_rating_average">
            {Number(shop.rating?.average || 0).toFixed(1)}
          </span>

          <span className="shop_rating_count">
            {shop.rating?.count || 0}{' '}
            {shop.rating?.count === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {shop.description && (
          <p className="shop_hero_description">{shop.description}</p>
        )}

        <div className="shop_location">
          <span className="rma_location_arrow_shop">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5.134 5 9C5 14.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="9"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>

          <span>{shop.address}</span>
        </div>
      </div>
    </section>
  );
}

export default ShopHero;
