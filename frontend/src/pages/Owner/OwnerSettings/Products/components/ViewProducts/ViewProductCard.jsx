function ViewProductCard({
  product,
  navigate,
  handleAvailabilityToggle,
  handleRemove,
}) {
  return (
    <div
      className={`product-card ${
        !product.available ? 'product-card-unavailable' : ''
      }`}
    >
      {/* IMAGE */}
      <div className="product-image-wrapper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            {product.category === 'Chicken'
              ? '🍗'
              : product.category === 'Mutton'
                ? '🥩'
                : product.category === 'Fish'
                  ? '🐟'
                  : product.category === 'Seafood'
                    ? '🦐'
                    : product.category === 'Eggs'
                      ? '🥚'
                      : '🛒'}
          </div>
        )}

        <span
          className={`availability-badge ${
            product.available ? 'available' : 'unavailable'
          }`}
        >
          {product.available ? 'Available' : 'Unavailable'}
        </span>
      </div>

      {/* CONTENT */}
      <div className="product-card-content">
        <div className="product-card-top">
          <div>
            <span className="product-category">{product.category}</span>

            <h3>{product.name}</h3>
          </div>

          <span
            className={`product-type ${
              product.isCustom ? 'custom' : 'catalogue'
            }`}
          >
            {product.isCustom ? 'Custom' : 'RMA'}
          </span>
        </div>

        <div className="product-price">
          ₹{Number(product.price).toFixed(0)}
          <span>/ {product.unit}</span>
        </div>

        {/* ACTIONS */}
        <div className="product-actions">
          <button
            className={`availability-button ${
              product.available ? 'make-unavailable' : 'make-available'
            }`}
            onClick={() => handleAvailabilityToggle(product)}
          >
            {product.available ? 'Mark Unavailable' : 'Mark Available'}
          </button>

          <div className="secondary-actions">
            <button
              onClick={() =>
                navigate(
                  `/owner/settings/products/change-price/${product.productId}`,
                )
              }
            >
              Price
            </button>

            <button
              onClick={() =>
                navigate(`/owner/settings/products/edit/${product.productId}`)
              }
            >
              Edit
            </button>

            <button
              className="remove-button"
              onClick={() => handleRemove(product)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProductCard;
