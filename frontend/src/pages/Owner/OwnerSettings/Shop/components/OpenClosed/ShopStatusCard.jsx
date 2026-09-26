function ShopStatusCard({ isOpen }) {
  return (
    <div className="shop_status_card">
      <div
        className={isOpen ? 'shop_status_icon open' : 'shop_status_icon closed'}
      >
        {isOpen ? '✓' : '×'}
      </div>

      <div className="shop_status_content">
        <span className="shop_status_label">Current Shop Status</span>

        <strong
          className={
            isOpen ? 'shop_status_value open' : 'shop_status_value closed'
          }
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </strong>

        <p>
          {isOpen
            ? 'Customers can currently place orders from your shop.'
            : 'Your shop is currently closed and customers should not place new orders.'}
        </p>
      </div>
    </div>
  );
}

export default ShopStatusCard;
