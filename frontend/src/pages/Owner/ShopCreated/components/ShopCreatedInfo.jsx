function ShopCreatedInfo({ owner }) {
  return (
    <>
      <section className="shop_created_info">
        <div className="shop_created_info_row">
          <span>Shop Name</span>

          <strong>{owner.shopName}</strong>
        </div>

        <div className="shop_created_info_row">
          <span>Owner</span>

          <strong>{owner.ownerName}</strong>
        </div>

        <div className="shop_created_info_row">
          <span>Mobile Number</span>

          <strong>{owner.phone}</strong>
        </div>
      </section>
    </>
  );
}

export default ShopCreatedInfo;
