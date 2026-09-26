import './Cart.css';

import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

import CartEmpty from './components/CartEmpty';
import CartHeader from './components/CartHeader';
import CartShop from './components/CartShop';
import CartItems from './components/CartItems';
import CartSummary from './components/CartSummary';

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
    return <CartEmpty onExploreShops={() => navigate('/find-shop')} />;
  }

  return (
    <main className="cart">
      <CartHeader totalItems={totalItems} />

      <CartShop shopName={cartItems[0].shopName} />

      <CartItems
        cartItems={cartItems}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
      />

      <CartSummary
        totalItems={totalItems}
        totalPrice={totalPrice}
        onCheckout={() => navigate('/checkout')}
      />
    </main>
  );
}

export default Cart;
