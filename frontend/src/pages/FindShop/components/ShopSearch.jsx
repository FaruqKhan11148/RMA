function ShopSearch({ shopId, onShopIdChange, onSubmit }) {
  return (
    <section className="find_shop_search">
      <div className="find_shop_section_header">
        <div>
          <span className="find_shop_section_eyebrow">2. KNOW YOUR SHOP?</span>

          <h2>Search by Shop ID</h2>

          <p>Enter the unique RMA Shop ID shared by your local shop.</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <label htmlFor="shopId">RMA Shop ID</label>

        <input
          id="shopId"
          type="text"
          placeholder="Example: RMA-000001"
          value={shopId}
          onChange={(event) => onShopIdChange(event.target.value)}
          autoComplete="off"
        />

        <button type="submit">
          Find Shop
          <span>→</span>
        </button>
      </form>
    </section>
  );
}

export default ShopSearch;
