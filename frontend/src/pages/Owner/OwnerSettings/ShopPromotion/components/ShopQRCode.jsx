import { QRCodeSVG } from 'qrcode.react';

function ShopQRCode({ shopName, shopId, shopUrl, qrRef }) {
  return (
    <section className="shop-qr-card">
      <div className="shop-qr-info">
        <span className="shop-qr-label">SHOP QR CODE</span>

        <h2>{shopName}</h2>

        <p>Customers can scan this QR code to open your shop directly.</p>
      </div>

      <div className="shop-qr-box" ref={qrRef}>
        {shopId ? (
          <QRCodeSVG value={shopUrl} size={220} level="H" includeMargin />
        ) : (
          <div className="shop-qr-missing">Shop ID unavailable</div>
        )}
      </div>

      <div className="shop-id-box">
        <span>Shop ID</span>

        <strong>{shopId || 'Unavailable'}</strong>
      </div>
    </section>
  );
}

export default ShopQRCode;
