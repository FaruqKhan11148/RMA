function ShopCard({ shop, onClick }) {
  return (
    <button type="button" className="admin-shop-card" onClick={onClick}>
      <div className="admin-shop-card-top">
        <span className="admin-shop-id">{shop.shopId}</span>

        <span className="admin-shop-arrow">→</span>
      </div>

      <h2>{shop.shopName || 'Unnamed Shop'}</h2>

      <p>Owner: {shop.ownerName || 'Unknown'}</p>

      <p>Phone: {shop.phone || 'Not available'}</p>
    </button>
  );
}

export default ShopCard;
