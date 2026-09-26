import { CheckCircle2, Package, ShoppingBag, Star } from 'lucide-react';

function OwnerShopOverview({ shopOwner, availableProducts, categories }) {
  return (
    <section className="owner_shop_section">
      <div className="owner_shop_section_header">
        <div>
          <h2>Shop Overview</h2>
          <span>Your current shop information</span>
        </div>
      </div>

      <div className="owner_shop_overview_grid">
        <div className="owner_shop_overview_card">
          <div className="owner_shop_overview_icon">
            <Package size={19} />
          </div>

          <div>
            <span>Products</span>
            <strong>{shopOwner.products?.length || 0}</strong>
          </div>
        </div>

        <div className="owner_shop_overview_card">
          <div className="owner_shop_overview_icon available">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Available</span>
            <strong>{availableProducts.length}</strong>
          </div>
        </div>

        <div className="owner_shop_overview_card">
          <div className="owner_shop_overview_icon">
            <ShoppingBag size={19} />
          </div>

          <div>
            <span>Categories</span>
            <strong>{categories.length}</strong>
          </div>
        </div>

        <div className="owner_shop_overview_card">
          <div className="owner_shop_overview_icon rating">
            <Star size={19} />
          </div>

          <div>
            <span>Rating</span>
            <strong>
              {shopOwner.rating?.average
                ? Number(shopOwner.rating.average).toFixed(1)
                : '—'}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OwnerShopOverview;
