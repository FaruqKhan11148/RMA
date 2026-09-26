function AddedProducts({ products, removeProduct }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="register_section">
      <h2>Added Products ({products.length})</h2>

      <div className="registered_products">
        {products.map((product) => (
          <div className="registered_product" key={product.productId}>
            <div>
              <strong>{product.name}</strong>

              <span>
                {product.category} • ₹{product.price} / {product.unit}
              </span>

              <small>
                {product.isCustom ? 'Custom Product' : 'RMA Catalogue'}
              </small>
            </div>

            <button
              type="button"
              onClick={() => removeProduct(product.productId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AddedProducts;
