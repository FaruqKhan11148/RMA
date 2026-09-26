function EditProductCustomFields({
  name,
  setName,
  category,
  setCategory,
  unit,
  setUnit,
  imageUrl,
  setImageUrl,
}) {
  return (
    <>
      <div className="edit-product-divider" />

      <div className="edit-product-section">
        <div className="edit-product-section-title">Product Information</div>

        <div className="edit-product-field">
          <label htmlFor="name">Product Name</label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter product name"
          />
        </div>

        <div className="edit-product-grid">
          <div className="edit-product-field">
            <label htmlFor="category">Category</label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Chicken"
            />
          </div>

          <div className="edit-product-field">
            <label htmlFor="unit">Unit</label>

            <input
              id="unit"
              type="text"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="e.g. KG"
            />
          </div>
        </div>

        <div className="edit-product-field">
          <label htmlFor="imageUrl">Image URL</label>

          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
    </>
  );
}

export default EditProductCustomFields;
