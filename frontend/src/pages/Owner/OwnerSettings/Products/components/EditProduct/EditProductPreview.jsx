import { optimizeCloudinaryImage } from '../../../../../../utils/optimizeCloudinaryImage';

function EditProductPreview({ product, available }) {
  return (
    <div className="edit-product-preview">
      <div className="edit-product-image">
        {product.imageUrl ? (
          <img
            src={optimizeCloudinaryImage(product.imageUrl, 300)}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
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
