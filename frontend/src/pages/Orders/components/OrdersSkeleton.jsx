import './OrdersSkeleton.css';

function OrdersSkeleton() {
  return (
    <main className="orders orders_skeleton">
      <div className="orders_header">
        <div className="orders_header_top">
          <div className="orders_skeleton_heading">
            <span className="orders_skeleton_block orders_skeleton_title" />
            <span className="orders_skeleton_block orders_skeleton_subtitle" />
          </div>

          <span className="orders_skeleton_block orders_skeleton_select" />
        </div>
      </div>

      <div className="orders_list" aria-label="Loading orders" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <article className="order_card orders_skeleton_card" key={index}>
            <div className="order_card_content">
              <div className="order_card_top">
                <span className="orders_skeleton_block orders_skeleton_order_id" />
                <span className="orders_skeleton_block orders_skeleton_status" />
              </div>

              <div className="order_card_middle">
                <span className="orders_skeleton_block orders_skeleton_shop" />
                <span className="orders_skeleton_block orders_skeleton_arrow" />
              </div>

              <div className="order_card_bottom">
                <span className="orders_skeleton_block orders_skeleton_meta" />
                <span className="orders_skeleton_block orders_skeleton_meta orders_skeleton_delivery" />
                <span className="orders_skeleton_block orders_skeleton_price" />
              </div>

              <div className="order_card_hint">
                <span className="orders_skeleton_block orders_skeleton_hint" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default OrdersSkeleton;
