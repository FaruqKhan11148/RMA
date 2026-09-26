function ShopQrSection({ onScan }) {
  return (
    <section className="find_shop_qr">
      <div className="find_shop_qr_icon">
        <span>QR</span>
      </div>

      <div className="find_shop_qr_content">
        <span className="find_shop_section_eyebrow">FASTEST WAY</span>

        <h2>Scan Shop QR</h2>

        <p>Scan the QR code provided by your local meat shop.</p>
      </div>

      <button type="button" className="find_shop_qr_button" onClick={onScan}>
        Scan
        <span>→</span>
      </button>
    </section>
  );
}

export default ShopQrSection;
