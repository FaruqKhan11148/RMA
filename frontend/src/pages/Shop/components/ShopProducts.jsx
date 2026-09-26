import { optimizeCloudinaryImage } from '../utils/imageHelpers';

function ShopProducts({ products, onAddToCart }) {
  return (
    <section className="products">
      <div className="products_header">
        <h2>Available Products</h2>

        <span>{products.length} items</span>
      </div>

      <div className="product_list">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <div className="product_card" key={product.productId}>
              <div className="product_image">
                {product.imageUrl ? (
                  <img
                    src={optimizeCloudinaryImage(product.imageUrl, 400)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="product_image_placeholder">RMA</div>
                )}
              </div>

              <div className="product_info">
                <h3>{product.name}</h3>

                <strong>
                  ₹{product.price}/{product.unit}
                </strong>
              </div>

              <button
                className="add_button"
                disabled={!product.available}
                onClick={() => onAddToCart(product)}
              >
                {product.available ? 'Add' : 'Unavailable'}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ShopProducts;
