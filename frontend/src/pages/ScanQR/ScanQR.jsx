import './ScanQR.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ScanQR() {
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleManualShopId = () => {
    setError('QR scanner will be connected next.');
  };

  return (
    <main className="scan_qr">
      <section className="scan_qr_card">
        <div className="scan_qr_header">
          <div className="scan_qr_logo">RMA</div>

          <p className="scan_qr_label">SCAN SHOP QR</p>

          <h1>Scan Shop QR</h1>

          <p>
            Scan the QR code provided by your meat or fish shop to start
            ordering directly from that shop.
          </p>
        </div>

        <div className="qr_scanner_box">
          <div className="scanner_corner top_left"></div>
          <div className="scanner_corner top_right"></div>
          <div className="scanner_corner bottom_left"></div>
          <div className="scanner_corner bottom_right"></div>

          <div className="scanner_placeholder">
            <span>QR</span>
            <p>Camera scanner</p>
          </div>

          <div className="scanner_line"></div>
        </div>

        <div className="scan_qr_info">
          <h2>Point your camera at the shop QR</h2>

          <p>
            The QR code will automatically identify the shop and open its
            products.
          </p>
        </div>

        {error && <p className="scan_qr_error">{error}</p>}

        <div className="scan_qr_actions">
          <button
            type="button"
            className="scan_qr_back"
            onClick={() => navigate('/')}
          >
            Back
          </button>

          <button
            type="button"
            className="scan_qr_manual"
            onClick={handleManualShopId}
          >
            Enter Shop ID
          </button>
        </div>
      </section>
    </main>
  );
}

export default ScanQR;
