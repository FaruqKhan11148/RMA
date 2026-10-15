import OwnerOrderCardSkeleton from './OwnerOrderCardSkeleton';

function OwnerOrdersLoading() {
  return (
    <main className="owner_orders" aria-busy="true" aria-label="Loading orders">
      <header className="owner_orders_header">
        <span className="owner_skeleton_line owner_loading_back" />

        <div className="owner_loading_header_content">
          <span className="owner_skeleton_line owner_loading_title" />
          <span className="owner_skeleton_line owner_loading_subtitle" />
        </div>
      </header>

      <section className="owner_order_filters owner_loading_filters">
        <span className="owner_skeleton_line owner_loading_filter_heading" />

        <div className="owner_loading_filter_buttons">
          {[1, 2, 3, 4, 5].map((item) => (
            <span
              className="owner_skeleton_block owner_loading_filter"
              key={item}
            />
          ))}
        </div>
      </section>

      <section className="owner_orders_list" aria-label="Order placeholders">
        {[1, 2, 3].map((item) => (
          <OwnerOrderCardSkeleton key={item} />
        ))}
      </section>
    </main>
  );
}

export default OwnerOrdersLoading;
