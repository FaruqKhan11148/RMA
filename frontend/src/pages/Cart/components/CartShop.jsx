function CartShop({ shopName }) {
  return (
    <section className="cart_shop">
      <div className="cart_shop_icon">R</div>

      <div className="cart_shop_info">
        <span>ORDERING FROM</span>

        <h2>{shopName}</h2>
      </div>
    </section>
  );
}

export default CartShop;
