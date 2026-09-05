import './ScanQR.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

function ScanQR() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);

  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);

  /* =========================================
     START QR SCANNER
  ========================================= */

  const startScanner = async () => {
    setError('');

    try {
      const scanner = new Html5Qrcode('qr-reader');

      scannerRef.current = scanner;

      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 220,
            height: 220,
          },
        },
        async (decodedText) => {
          console.log('QR Scanned:', decodedText);

          await stopScanner();

          const shopId = extractShopId(decodedText);

          if (!shopId) {
            setError('Invalid RMA shop QR code.');
            return;
          }

          navigate(`/shop/${shopId}`);
        },
        () => {
          // Ignore normal scanning failures.
          // This callback fires when a frame does not contain a QR code.
        }
      );
    } catch (err) {
      console.error('QR scanner error:', err);

      setScanning(false);

      setError(
        'Unable to access your camera. Please allow camera permission and try again.'
      );
    }
  };

  /* =========================================
     STOP QR SCANNER
  ========================================= */

  const stopScanner = async () => {
    if (!scannerRef.current) return;

    try {
      const scanner = scannerRef.current;

      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }

    scannerRef.current = null;
    setScanning(false);
  };

  /* =========================================
     EXTRACT SHOP ID
  ========================================= */

  const extractShopId = (value) => {
    if (!value) return null;

    const text = value.trim();

    /*
      Case 1:
      QR contains only:

      RMA-000005
    */

    if (/^RMA-\d+$/i.test(text)) {
      return text.toUpperCase();
    }

    /*
      Case 2:
      QR contains:

      http://localhost:3000/shop/RMA-000005

      or

      https://rma.com/shop/RMA-000005
    */

    try {
      const url = new URL(text);

      const parts = url.pathname.split('/').filter(Boolean);

      const shopIndex = parts.findIndex(
        (part) => part.toLowerCase() === 'shop'
      );

      if (shopIndex !== -1 && parts[shopIndex + 1]) {
        const shopId = parts[shopIndex + 1];

        if (/^RMA-\d+$/i.test(shopId)) {
          return shopId.toUpperCase();
        }
      }
    } catch (err) {
      // Not a URL.
    }

    /*
      Case 3:
      Try finding RMA ID anywhere in the text.
    */

    const match = text.match(/RMA-\d+/i);

    if (match) {
      return match[0].toUpperCase();
    }

    return null;
  };

  /* =========================================
     MANUAL SHOP ID
  ========================================= */

  const handleManualShopId = () => {
    setError('');

    const shopId = manualId.trim().toUpperCase();

    if (!shopId) {
      setError('Please enter a shop ID.');
      return;
    }

    if (!/^RMA-\d+$/.test(shopId)) {
      setError('Please enter a valid RMA shop ID, for example RMA-000005.');
      return;
    }

    navigate(`/shop/${shopId}`);
  };

  /* =========================================
     CLEANUP
  ========================================= */

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current
              ?.clear()
              .catch(() => {});
          });
      }
    };
  }, []);

  return (
    <main className="scan_qr">

      <section className="scan_qr_card">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="scan_qr_header">

          <div className="scan_qr_logo">
            RMA
          </div>

          <p className="scan_qr_label">
            SHOP ACCESS
          </p>

          <h1>
            Scan Shop QR
          </h1>

          <p>
            Scan the QR code provided by your meat or fish shop
            to start ordering directly from that shop.
          </p>

        </div>


        {/* =========================================
            REAL QR SCANNER
        ========================================= */}

        <div className="qr_scanner_box">

          {!scanning && (
            <>
              <div className="scanner_corner top_left"></div>
              <div className="scanner_corner top_right"></div>
              <div className="scanner_corner bottom_left"></div>
              <div className="scanner_corner bottom_right"></div>

              <div className="scanner_placeholder">

                <span>
                  QR
                </span>

                <p>
                  Camera scanner
                </p>

              </div>
            </>
          )}

          <div
            id="qr-reader"
            className="qr_reader"
          />

          {scanning && (
            <>
              <div className="scanner_corner top_left"></div>
              <div className="scanner_corner top_right"></div>
              <div className="scanner_corner bottom_left"></div>
              <div className="scanner_corner bottom_right"></div>

              <div className="scanner_line"></div>
            </>
          )}

        </div>


        {/* =========================================
            INFO
        ========================================= */}

        <div className="scan_qr_info">

          <h2>
            {scanning
              ? 'Scanning for shop QR...'
              : 'Ready to scan'}
          </h2>

          <p>
            {scanning
              ? 'Point your camera at the QR code provided by the shop.'
              : 'Tap the button below to activate your camera.'}
          </p>

        </div>


        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <div className="scan_qr_error">
            {error}
          </div>
        )}


        {/* =========================================
            MANUAL SHOP ID
        ========================================= */}

        {showManual && (
          <div className="manual_shop_section">

            <label htmlFor="manual-shop-id">
              Shop ID
            </label>

            <div className="manual_shop_row">

              <input
                id="manual-shop-id"
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="RMA-000005"
                autoComplete="off"
              />

              <button
                type="button"
                onClick={handleManualShopId}
              >
                Open
              </button>

            </div>

          </div>
        )}


        {/* =========================================
            ACTIONS
        ========================================= */}

        <div className="scan_qr_actions">

          <button
            type="button"
            className="scan_qr_back"
            onClick={() => {
              stopScanner();
              navigate('/');
            }}
          >
            Back
          </button>


          {!scanning ? (
            <button
              type="button"
              className="scan_qr_manual"
              onClick={() => {
                setShowManual(false);
                startScanner();
              }}
            >
              Start Camera
            </button>
          ) : (
            <button
              type="button"
              className="scan_qr_manual scan_qr_stop"
              onClick={stopScanner}
            >
              Stop Camera
            </button>
          )}

        </div>


        {!scanning && (
          <button
            type="button"
            className="enter_shop_button"
            onClick={() => {
              setShowManual((prev) => !prev);
              setError('');
            }}
          >
            {showManual ? 'Hide Shop ID' : 'Enter Shop ID Instead'}
          </button>
        )}

      </section>

    </main>
  );
}

export default ScanQR;