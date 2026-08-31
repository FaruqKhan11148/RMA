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
        <h1>Your Cart is Empty</h1>

        <p>Add some products from your shop.</p>
      </main>
    );
  }

  return (
    <main className="cart">
      {/* HEADER */}

      <section className="cart_header">
        <h1>Your Cart</h1>

        <span>{totalItems} items</span>
      </section>

      {/* SHOP */}

      <section className="cart_shop">
        <p>Ordering from</p>

        <h2>{cartItems[0].shopName}</h2>
      </section>

      {/* CART ITEMS */}

      <section className="cart_items">
        {cartItems.map((item) => (
          <div className="cart_item" key={item.product.productId}>
            <div className="cart_item_info">
              <h3>{item.product.name}</h3>

              <p>
                ₹{item.product.price} / {item.product.unit}
              </p>

              <strong>₹{item.product.price * item.quantity}</strong>
            </div>

            {/* QUANTITY */}

            <div className="cart_controls">
              <button onClick={() => decreaseQuantity(item.product.productId)}>
                −
              </button>

              <span>{item.quantity}</span>

              <button onClick={() => increaseQuantity(item.product.productId)}>
                +
              </button>
            </div>

            {/* REMOVE */}

            <button
              className="remove_button"
              onClick={() => removeFromCart(item.product.productId)}
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* SUMMARY */}

      <section className="cart_summary">
        <div>
          <span>Total</span>

          <strong>₹{totalPrice}</strong>
        </div>

        <button
          className="checkout_button"
          onClick={() => navigate('/checkout')}
        >
          Continue to Checkout
        </button>
      </section>
    </main>
  );
}

export default Cart;
