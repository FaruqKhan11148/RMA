function CatalogueProductForm({
  productCatalogue,
  selectedCategoryId,
  selectedCategory,
  selectedProductId,
  selectedCatalogueProduct,
  existingProducts,
  price,
  handleCategoryChange,
  handleCatalogueProductChange,
  setPrice,
}) {
  return (
    <>
      <div className="form-section">
        <h2>RMA Catalogue Product</h2>
        <p>
          Choose a product from the RMA catalogue and set your selling price.
        </p>
      </div>

      <div className="form-group">
        <label>Category</label>

        <select value={selectedCategoryId} onChange={handleCategoryChange}>
          <option value="">Select category</option>

          {productCatalogue.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="form-group">
          <label>Product</label>

          <select
            value={selectedProductId}
            onChange={handleCatalogueProductChange}
          >
            <option value="">Select product</option>

            {selectedCategory.products.map((product) => {
              const alreadyAdded = existingProducts.some(
                (existing) => existing.catalogueProductId === product.productId,
              );

              return (
                <option
                  key={product.productId}
                  value={product.productId}
                  disabled={alreadyAdded}
                >
                  {product.name}
                  {alreadyAdded ? ' — Already added' : ''}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {selectedCatalogueProduct && (
        <div className="catalogue-preview">
          <div className="catalogue-preview-image">
            {selectedCatalogueProduct.imageUrl ? (
              <img
                src={selectedCatalogueProduct.imageUrl}
                alt={selectedCatalogueProduct.name}
              />
            ) : (
              <span>🍗</span>
            )}
          </div>

          <div>
            <span className="preview-label">RMA Catalogue</span>
            <h3>{selectedCatalogueProduct.name}</h3>
            <p>Category: {selectedCategory.categoryName}</p>
            <p>Unit: {selectedCatalogueProduct.unit}</p>
          </div>
        </div>
      )}

      {selectedCatalogueProduct && (
        <div className="form-group">
          <label>Your Selling Price</label>

          <div className="price-input">
            <span>₹</span>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CatalogueProductForm;
