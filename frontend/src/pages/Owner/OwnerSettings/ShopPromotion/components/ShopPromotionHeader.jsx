function ShopPromotionHeader({ navigate }) {
  return (
    <div className="shop-promotion-header">
      <button
        className="shop-promotion-back"
        onClick={() => navigate('/owner/settings/account')}
      >
        ← Settings
      </button>

      <div>
        <h1>Shop QR & Poster</h1>

        <p>Help customers discover and order from your shop.</p>
      </div>
    </div>
  );
}

export default ShopPromotionHeader;
    