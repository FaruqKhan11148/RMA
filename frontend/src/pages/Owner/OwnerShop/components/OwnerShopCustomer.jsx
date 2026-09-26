import { ShoppingBag } from 'lucide-react';

function OwnerShopCustomer({ viewCustomerShop }) {
  return (
    <section className="owner_shop_customer_card">
      <div className="owner_shop_customer_icon">
        <ShoppingBag size={22} />
      </div>

      <div className="owner_shop_customer_content">
        <strong>Customer Shop</strong>
        <span>See how customers can find and view your shop.</span>
      </div>

      <button
        type="button"
        className="owner_shop_customer_button"
        onClick={viewCustomerShop}
      >
        View
      </button>
    </section>
  );
}

export default OwnerShopCustomer;
