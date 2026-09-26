function ShopCreatedNumber({ shopId }) {
  return (
    <>
      <section className="shop_number_section">
        <p>Your RMA Shop Number</p>

        <strong className="shop_number">{shopId}</strong>

        <span>Use this number to identify your shop.</span>
      </section>
    </>
  );
}

export default ShopCreatedNumber;
