function CatalogueProducts({
  productCatalogue,
  selectedCategory,
  products,
  productPrices,
  handleCategorySelect,
  handleProductPriceChange,
  addCatalogueProduct,
}) {
  return (
    <section className="register_section">
      <h2>RMA Product Catalogue</h2>

      <p className="section_description">
        Select products from the RMA catalogue and set your shop price.
      </p>

      {/* CATEGORIES */}

      <div className="catalogue_categories">
        {productCatalogue.map((category) => (
          <button
            type="button"
            key={category.categoryId}
            className={
              selectedCategory?.categoryId === category.categoryId
                ? 'catalogue_category active'
                : 'catalogue_category'
            }
            onClick={() => handleCategorySelect(category)}
          >
            {category.categoryName}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}

      {selectedCategory && (
        <div className="catalogue_products">
          <h3>{selectedCategory.categoryName}</h3>

          <div className="catalogue_product_grid">
            {selectedCategory.products.map((product) => {
              const alreadyAdded = products.some(
                (item) => item.catalogueProductId === product.productId,
              );

              return (
                <div className="catalogue_product_card" key={product.productId}>
                  <img src={product.imageUrl} alt={product.name} />

                  <div className="catalogue_product_info">
                    <h4>{product.name}</h4>

                    <p>Unit: {product.unit}</p>

                    <input
                      type="number"
                      min="1"
                      placeholder="Enter price"
                      value={productPrices[product.productId] || ''}
                      onChange={(event) =>
                        handleProductPriceChange(
                          product.productId,
                          event.target.value,
                        )
                      }
                      disabled={alreadyAdded}
                    />

                    <button
                      type="button"
                      className="add_product_button"
                      onClick={() => addCatalogueProduct(product)}
                      disabled={alreadyAdded}
                    >
                      {alreadyAdded ? 'Added' : '+ Add Product'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default CatalogueProducts;
