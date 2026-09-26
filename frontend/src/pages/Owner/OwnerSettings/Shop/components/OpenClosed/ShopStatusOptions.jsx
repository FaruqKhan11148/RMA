function ShopStatusOptions({ isOpen, handleStatusChange, saving }) {
  return (
    <div className="shop_status_options">
      <button
        type="button"
        className={
          isOpen
            ? 'shop_status_option active open_option'
            : 'shop_status_option open_option'
        }
        onClick={() => handleStatusChange(true)}
        disabled={saving}
      >
        <span className="shop_status_option_icon">✓</span>

        <span>
          <strong>Open Shop</strong>
          <small>Allow customers to order</small>
        </span>
      </button>

      <button
        type="button"
        className={
          !isOpen
            ? 'shop_status_option active closed_option'
            : 'shop_status_option closed_option'
        }
        onClick={() => handleStatusChange(false)}
        disabled={saving}
      >
        <span className="shop_status_option_icon">×</span>

        <span>
          <strong>Close Shop</strong>
          <small>Stop accepting new orders</small>
        </span>
      </button>
    </div>
  );
}

export default ShopStatusOptions;
