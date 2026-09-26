function CheckoutEmpty({ onExploreShops }) {
  return (
    <main className="checkout_empty">
      <div className="checkout_empty_icon">🛒</div>

      <h1>Your cart is empty</h1>

      <p>Add some products to your cart before continuing to checkout.</p>

      <button type="button" onClick={onExploreShops}>
        Explore Shops
        <span>→</span>
      </button>
    </main>
  );
}

export default CheckoutEmpty;
