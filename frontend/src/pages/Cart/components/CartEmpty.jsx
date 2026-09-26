function CartEmpty({ onExploreShops }) {
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
        onClick={onExploreShops}
      >
        Explore Shops
        <span>→</span>
      </button>
    </main>
  );
}

export default CartEmpty;
