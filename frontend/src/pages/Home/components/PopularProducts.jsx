function PopularProducts({
  userLocation,
  nearbyShops,
  loadingNearbyShops,
  nearbyShopsError,
  popularProducts,
  optimizeCloudinaryImage,
  onExplore,
  onProductClick,
}) {
  return (
    userLocation &&
    nearbyShops.length > 0 && (
      <section className="popular_products">
        <div className="popular_products_header">
          <div>
            <span className="popular_products_eyebrow">
              CUSTOMER FAVOURITES
            </span>

            <h2>Popular Near You</h2>

            <p>Fresh picks from nearby shops</p>
          </div>

          <button className="popular_products_see_all" onClick={onExplore}>
            Explore
            <span>→</span>
          </button>
        </div>

        {!loadingNearbyShops &&
          !nearbyShopsError &&
          popularProducts.length > 0 && (
            <div className="popular_products_list">
              {popularProducts.map((product, index) => (
                <button
                  key={`${product.shopId}-${product._id || product.productId || index}`}
                  className="popular_product_card"
                  onClick={() => onProductClick(product.shopId)}
                >
                  <div className="popular_product_image">
                    <img
                      src={optimizeCloudinaryImage(product.imageUrl, 500)}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="popular_product_tag">POPULAR</span>
                  </div>

                  <div className="popular_product_content">
                    <h3>{product.name}</h3>

                    <p className="popular_product_shop">{product.shopName}</p>

                    <div className="popular_product_bottom">
                      <span className="popular_product_price">
                        ₹{product.price}
                        {product.unit && ` / ${product.unit}`}
                      </span>

                      <span className="popular_product_arrow">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

        {!loadingNearbyShops &&
          !nearbyShopsError &&
          popularProducts.length === 0 && (
            <div className="popular_products_empty">
              Popular products will appear here as shops add their products.
            </div>
          )}
      </section>
    )
  );
}

export default PopularProducts;
