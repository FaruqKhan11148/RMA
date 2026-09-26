function ChangePriceHeader({ navigate }) {
  return (
    <>
      <button
        type="button"
        className="change-price-back"
        onClick={() => navigate('/owner/settings/products')}
      >
        ← Products Settings
      </button>

      <div className="change-price-header">
        <h1>Change Price</h1>

        <p>Update the selling price of this product.</p>
      </div>
    </>
  );
}

export default ChangePriceHeader;
