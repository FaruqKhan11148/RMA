function SavedShop({ loadingShop, shopError, shop, onOrder }) {
  if (!loadingShop && !shopError && !shop) {
    return null;
  }

  return (
    <section className="find_shop_saved">
      <div className="find_shop_section_header">
        <div>
          <span className="find_shop_section_eyebrow">3. YOUR SHOP</span>

          <h2>Saved Shop</h2>
        </div>
      </div>

      {loadingShop && (
        <div className="find_shop_message">Loading your saved shop...</div>
      )}

      {!loadingShop && shopError && (
        <div className="find_shop_message find_shop_error">{shopError}</div>
      )}

      {!loadingShop && shop && (
        <div className="find_shop_saved_card">
          <div className="find_shop_saved_info">
            <h3>{shop.shopName}</h3>

            <p>{shop.description || 'Fresh meat and seafood'}</p>

            <span>{shop.shopId}</span>
          </div>

          <button type="button" onClick={onOrder}>
            Order
            <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default SavedShop;
