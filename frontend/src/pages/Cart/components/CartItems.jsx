import CartItem from './CartItem';

function CartItems({ cartItems, onIncrease, onDecrease, onRemove }) {
  return (
    <section className="cart_items">
      <div className="cart_items_header">
        <h2>Your Items</h2>

        <span>{cartItems.length} products</span>
      </div>

      {cartItems.map((item) => (
        <CartItem
          key={item.product.productId}
          item={item}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
        />
      ))}
    </section>
  );
}

export default CartItems;
