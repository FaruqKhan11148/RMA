function EditProductPreview({ product, available }) {
  return (
    <div className="edit-product-preview">
      <div className="edit-product-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span>
            {product.category === 'Chicken'
              ? '🍗'
              : product.category === 'Mutton'
                ? '🥩'
                : product.category === 'Fish'
                  ? '🐟'
                  : product.category === 'Seafood'
                    ? '🦐'
                    : '🥩'}
          </span>
        )}
      </div>

      <div className="edit-product-preview-info">
        <h2>{product.name}</h2>

        <p>
          {product.category} • {product.unit}
        </p>

        <span
          className={`edit-product-status ${
            available ? 'available' : 'unavailable'
          }`}
        >
          {available ? 'Available' : 'Unavailable'}
        </span>
      </div>
    </div>
  );
}

export default EditProductPreview;
