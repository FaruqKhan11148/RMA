function CheckoutShop({ shopName }) {
  return (
    <section className="checkout_shop_card">
      <div className="checkout_shop_icon">R</div>

      <div className="checkout_shop_info">
        <span>ORDERING FROM</span>

        <h2>{shopName}</h2>
      </div>
    </section>
  );
}

export default CheckoutShop;
