import { Package } from 'lucide-react';

function OwnerShopProducts({ availableProducts, previewProducts, navigate }) {
  return (
    <section className="owner_shop_section">
      <div className="owner_shop_section_header">
        <div>
          <h2>Products</h2>
          <span>
            {availableProducts.length === 0
              ? 'No available products'
              : `${availableProducts.length} available product${
                  availableProducts.length > 1 ? 's' : ''
                }`}
          </span>
        </div>

        <button
          type="button"
          className="owner_shop_section_action"
          onClick={() => navigate('/owner/settings/products')}
        >
          Manage
        </button>
      </div>

      {previewProducts.length === 0 ? (
        <div className="owner_shop_empty">
          <Package size={28} />
          <strong>No available products</strong>
          <p>Add products from your product settings.</p>
        </div>
      ) : (
        <div className="owner_shop_products">
          {previewProducts.map((product) => (
            <div className="owner_shop_product_card" key={product.productId}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="owner_shop_product_placeholder">
                  <Package size={22} />
                </div>
              )}

              <div className="owner_shop_product_content">
                <strong>{product.name}</strong>
                <span>
                  {product.category} · {product.unit}
                </span>
                <b>₹{product.price}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OwnerShopProducts;
