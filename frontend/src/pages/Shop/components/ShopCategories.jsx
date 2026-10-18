function ShopCategories({
  categories,
  selectedCategory,
  onCategoryChange,
  onBulkOrdersClick,
}) {
  return (
    <section className="categories">
      <h2>Categories</h2>

      <div className="category_list">
        <button
          type="button"
          className={selectedCategory === 'All' ? 'category_active' : ''}
          onClick={() => onCategoryChange('All')}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? 'category_active' : ''}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}

        <button
          type="button"
          className="category_bulk_orders"
          onClick={onBulkOrdersClick}
        >
          Bulk Orders
        </button>
      </div>
    </section>
  );
}

export default ShopCategories;
