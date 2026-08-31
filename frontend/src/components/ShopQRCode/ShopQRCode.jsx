import './ShopQRCode.css';

import { QRCodeCanvas } from 'qrcode.react';

function ShopQRCode({ shopId }) {
  const shopUrl = `${window.location.origin}/shop/${shopId}`;

  const downloadQRCode = () => {
    const canvas = document.getElementById('rma-shop-qr');

    if (!canvas) {
      return;
    }

    const pngUrl = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');

    downloadLink.href = pngUrl;
    downloadLink.download = `${shopId}-QR.png`;

    downloadLink.click();
  };

  return (
    <section className="shop_qr_section">
      <h2>Your Shop QR Code</h2>

      <p>Customers can scan this QR code to open your shop.</p>

      <div className="shop_qr_code">
        <QRCodeCanvas
          id="rma-shop-qr"
          value={shopUrl}
          size={220}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </div>

      <div className="shop_qr_shop_id">
        <span>Shop Number</span>

        <strong>{shopId}</strong>
      </div>

      <p className="shop_qr_url">{shopUrl}</p>

      <button
        type="button"
        className="shop_qr_download_button"
        onClick={downloadQRCode}
      >
        Download QR
      </button>
    </section>
  );
}

export default ShopQRCode;
