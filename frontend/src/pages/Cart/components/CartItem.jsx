import { optimizeCloudinaryImage } from '../utils/cartHelpers';

function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="cart_item">
      <div className="cart_item_image">
        {item.product.imageUrl ? (
          <img
            src={optimizeCloudinaryImage(item.product.imageUrl, 400)}
            alt={item.product.name}
          />
        ) : (
          <div className="cart_item_image_placeholder">RMA</div>
        )}
      </div>

      <div className="cart_item_content">
        <div className="cart_item_top">
          <div className="cart_item_info">
            <h3>{item.product.name}</h3>

            <p>
              ₹{item.product.price} / {item.product.unit}
            </p>
          </div>

          <button
            type="button"
            className="remove_button"
            onClick={() => onRemove(item.product.productId)}
            aria-label={`Remove ${item.product.name}`}
          >
            ×
          </button>
        </div>

        <div className="cart_item_bottom">
          <div className="cart_controls">
            <button
              type="button"
              onClick={() => onDecrease(item.product.productId)}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              type="button"
              onClick={() => onIncrease(item.product.productId)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <strong>₹{item.product.price * item.quantity}</strong>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
