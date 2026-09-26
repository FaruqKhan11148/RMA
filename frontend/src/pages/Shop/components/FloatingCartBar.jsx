import { useNavigate } from 'react-router-dom';

import { optimizeCloudinaryImage } from '../utils/imageHelpers';

function FloatingCartBar({ cartItems, totalItems }) {
  const navigate = useNavigate();

  return (
    <div className="floating_cart_bar">
      <div className="floating_cart_item">
        <div className="floating_cart_image">
          {cartItems[0].imageUrl ? (
            <img
              src={optimizeCloudinaryImage(cartItems[0].imageUrl, 150)}
              alt={cartItems[0].productName}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="floating_cart_image_placeholder">RMA</div>
          )}
        </div>

        <div className="floating_cart_info">
          <strong>{cartItems[0].productName}</strong>

          <span>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>

        <button
          type="button"
          className="floating_cart_button"
          onClick={() => navigate('/cart')}
        >
          <span>View Cart</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default FloatingCartBar;
