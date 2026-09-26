import { Copy } from 'lucide-react';

function OwnerShopHeader({ shopOwner, copied, copyShopId }) {
  return (
    <section className="owner_shop_header">
      <div className="owner_shop_header_content">
        <div className="owner_shop_status">
          {shopOwner.isOpen ? (
            <>
              <span className="owner_shop_status_dot open" />
              Open
            </>
          ) : (
            <>
              <span className="owner_shop_status_dot closed" />
              Closed
            </>
          )}
        </div>

        <h1>{shopOwner.shopName}</h1>

        <div className="owner_shop_id_row">
          <span>Shop ID: {shopOwner.shopId}</span>

          <button
            type="button"
            className="owner_shop_copy_button"
            onClick={copyShopId}
            aria-label="Copy shop ID"
          >
            <Copy size={15} />
          </button>

          {copied && <small>Copied</small>}
        </div>

        {shopOwner.description && (
          <p className="owner_shop_description">{shopOwner.description}</p>
        )}
      </div>
    </section>
  );
}

export default OwnerShopHeader;
