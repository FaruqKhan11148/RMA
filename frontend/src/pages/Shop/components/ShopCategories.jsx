function ShopCategories({ categories, selectedCategory, onCategoryChange }) {
  return (
    <section className="categories">
      <h2>Categories</h2>

      <div className="category_list">
        <button
          className={selectedCategory === 'All' ? 'category_active' : ''}
          onClick={() => onCategoryChange('All')}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'category_active' : ''}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
}

export default ShopCategories;
