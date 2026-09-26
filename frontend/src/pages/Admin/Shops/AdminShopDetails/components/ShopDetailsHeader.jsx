function ShopDetailsHeader({ shop, onBack }) {
  return (
    <header className="admin-shop-details-header">
      <div>
        <button
          type="button"
          className="admin-shop-details-back"
          onClick={onBack}
        >
          ← Shops
        </button>

        <span className="admin-shop-details-id">{shop.shopId}</span>

        <h1>{shop.shopName || 'Unnamed Shop'}</h1>

        <p>
          Owner: {shop.ownerName || 'Unknown'} · {shop.phone || 'No phone'}
        </p>
      </div>
    </header>
  );
}

export default ShopDetailsHeader;
