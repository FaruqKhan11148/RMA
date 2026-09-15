import './Cart.css';

import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="cart_empty">
        <div className="cart_empty_icon">🛒</div>

        <h1>Your Cart is Empty</h1>

        <p>
          Looks like you haven't added anything yet.
          <br />
          Explore nearby shops and start shopping.
        </p>

        <button
          type="button"
          className="cart_empty_button"
          onClick={() => navigate('/find-shop')}
        >
          Explore Shops
          <span>→</span>
        </button>
      </main>
    );
  }

  return (
    <main className="cart">
      {/* HEADER */}

      <section className="cart_header">
        <div>
          <span className="cart_eyebrow">YOUR ORDER</span>

          <h1>Your Cart</h1>
        </div>

        <span className="cart_item_count">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </section>

      {/* SHOP */}

      <section className="cart_shop">
        <div className="cart_shop_icon">R</div>

        <div className="cart_shop_info">
          <span>ORDERING FROM</span>

          <h2>{cartItems[0].shopName}</h2>
        </div>
      </section>

      {/* CART ITEMS */}

      <section className="cart_items">
        <div className="cart_items_header">
          <h2>Your Items</h2>

          <span>{cartItems.length} products</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart_item" key={item.product.productId}>
            <div className="cart_item_image">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} />
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
                  onClick={() => removeFromCart(item.product.productId)}
                  aria-label={`Remove ${item.product.name}`}
                >
                  ×
                </button>
              </div>

              <div className="cart_item_bottom">
                <div className="cart_controls">
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.product.productId)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.product.productId)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <strong>₹{item.product.price * item.quantity}</strong>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* SUMMARY */}

      <section className="cart_summary">
        <div className="cart_summary_header">
          <h2>Order Summary</h2>
        </div>

        <div className="cart_summary_row">
          <span>Items</span>

          <span>{totalItems}</span>
        </div>

        <div className="cart_summary_row">
          <span>Item total</span>

          <strong>₹{totalPrice}</strong>
        </div>

        <div className="cart_summary_divider" />

        <div className="cart_summary_total">
          <span>Total</span>

          <strong>₹{totalPrice}</strong>
        </div>

        <button
          type="button"
          className="checkout_button"
          onClick={() => navigate('/checkout')}
        >
          <span>Continue to Checkout</span>

          <span>→</span>
        </button>
      </section>
    </main>
  );
}

export default Cart;
