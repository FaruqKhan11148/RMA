function CartHeader({ totalItems }) {
  return (
    <section className="cart_header">
      <div>
        <span className="cart_eyebrow">YOUR ORDER</span>

        <h1>Your Cart</h1>
      </div>

      <span className="cart_item_count">
        {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </span>
    </section>
  );
}

export default CartHeader;
