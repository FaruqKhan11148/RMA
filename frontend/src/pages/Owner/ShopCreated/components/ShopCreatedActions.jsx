function ShopCreatedActions({ navigate }) {
  return (
    <>
      <div className="shop_created_actions">
        <button
          className="shop_created_button primary"
          onClick={() => navigate('/owner/dashboard')}
        >
          Go to Dashboard
        </button>

        <button
          className="shop_created_button secondary"
          onClick={() => navigate('/owner/login')}
        >
          Go to Login
        </button>
      </div>
    </>
  );
}

export default ShopCreatedActions;
