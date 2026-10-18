import './BusinessCategories.css';

const BUSINESS_CATEGORIES = [
  {
    id: 'RETAIL',
    name: 'Retail Shop',
    description: 'Regular household customers',
  },
  {
    id: 'SHAWARMA',
    name: 'Shawarma Shops',
    description: 'Bulk supply for shawarma preparation',
  },
  {
    id: 'HOTELS',
    name: 'Hotels',
    description: 'Supply for hotel kitchens',
  },
  {
    id: 'RESTAURANTS',
    name: 'Restaurants',
    description: 'Supply for restaurant kitchens',
  },
  {
    id: 'CATERERS',
    name: 'Caterers',
    description: 'Weddings, events and functions',
  },
  {
    id: 'WHOLESALE',
    name: 'Wholesale Suppliers',
    description: 'Bulk supply to other businesses',
  },
];

function BusinessCategories({ selectedBusinessCategories, onChange }) {
  const toggleCategory = (categoryId) => {
    if (categoryId === 'RETAIL') return;

    const isSelected = selectedBusinessCategories.includes(categoryId);

    const updatedCategories = isSelected
      ? selectedBusinessCategories.filter((id) => id !== categoryId)
      : [...selectedBusinessCategories, categoryId];

    onChange(['RETAIL', ...updatedCategories.filter((id) => id !== 'RETAIL')]);
  };

  return (
    <section className="register_section">
      <h2>Business Categories</h2>

      <p className="section_description">
        Choose the types of customers your shop supplies. Retail is enabled by
        default.
      </p>

      <div className="business_categories_grid">
        {BUSINESS_CATEGORIES.map((category) => {
          const isSelected = selectedBusinessCategories.includes(category.id);
          const isRetail = category.id === 'RETAIL';

          return (
            <button
              key={category.id}
              type="button"
              className={`business_category_card ${isSelected ? 'active' : ''}`}
              onClick={() => toggleCategory(category.id)}
              aria-pressed={isSelected}
              disabled={isRetail}
            >
              <span className="business_category_check">
                {isSelected ? '✓' : '+'}
              </span>

              <strong>{category.name}</strong>

              <span>{category.description}</span>

              {isRetail && <small>Always enabled</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default BusinessCategories;
