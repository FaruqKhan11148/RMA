function CheckoutPageSkeleton() {
  return (
    <main
      className="checkout checkout_page_skeleton"
      role="status"
      aria-label="Loading checkout"
      aria-busy="true"
    >
      <div className="checkout_skeleton_header">
        <div className="checkout_skeleton_block skeleton_eyebrow" />
        <div className="checkout_skeleton_block skeleton_title" />
        <div className="checkout_skeleton_block skeleton_description" />
      </div>

      <div className="checkout_skeleton_block skeleton_shop" />

      <div className="checkout_layout">
        <div className="checkout_main">
          <section className="checkout_card checkout_skeleton_card">
            <div className="checkout_skeleton_block skeleton_section_title" />
            <div className="checkout_skeleton_block skeleton_section_text" />
            <div className="checkout_skeleton_block skeleton_location" />
          </section>

          <section className="checkout_card checkout_skeleton_card">
            <div className="checkout_skeleton_block skeleton_section_title" />
            <div className="checkout_skeleton_block skeleton_section_text" />

            <div className="checkout_skeleton_block skeleton_input" />
            <div className="checkout_skeleton_block skeleton_input" />
            <div className="checkout_skeleton_block skeleton_textarea" />
          </section>
        </div>

        <aside className="checkout_sidebar">
          <section className="checkout_summary_card checkout_skeleton_card">
            <div className="checkout_skeleton_block skeleton_section_title" />

            {[1, 2, 3].map((item) => (
              <div className="skeleton_summary_item" key={item}>
                <div className="checkout_skeleton_block skeleton_summary_name" />
                <div className="checkout_skeleton_block skeleton_summary_price" />
              </div>
            ))}

            <div className="checkout_skeleton_block skeleton_summary_row" />
            <div className="checkout_skeleton_block skeleton_summary_row" />
            <div className="checkout_skeleton_block skeleton_summary_total" />
            <div className="checkout_skeleton_block skeleton_checkout_button" />
          </section>

          <div className="checkout_skeleton_block skeleton_secure_note" />
        </aside>
      </div>

      <span className="checkout_skeleton_sr">Loading checkout details…</span>
    </main>
  );
}

export default CheckoutPageSkeleton;
