import './ScanQR.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { extractShopId, validateShopId } from './utils/qrHelpers';

import ScanQRHeader from './components/ScanQRHeader';
import QRScannerBox from './components/QRScannerBox';
import ScanQRInfo from './components/ScanQRInfo';
import ManualShopId from './components/ManualShopId';
import ScanQRActions from './components/ScanQRActions';
import GalleryQRUpload from './components/GalleryQRUpload';
import {
  startQRScanner,
  stopQRScanner,
  cleanupQRScanner,
  scanQRFromGallery,
} from './utils/qrScanner';

function ScanQR() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);

  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [showManual, setShowManual] = useState(false);

  /* =========================================
     MANUAL SHOP ID
  ========================================= */

  const handleManualShopId = () => {
    setError('');

    const result = validateShopId(manualId);

    if (!result.valid) {
      setError(result.error);
      return;
    }

    localStorage.setItem('rma_trusted_shop_id', result.shopId);

    navigate(`/shop/${result.shopId}`);
  };

  useEffect(() => {
    return () => {
      cleanupQRScanner(scannerRef);
    };
  }, []);

  const handleGalleryScan = async (event) => {
    setError('');

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await scanQRFromGallery({
      file,
      setError,
      extractShopId,
      navigate,
    });

    event.target.value = '';
  };

  return (
    <main className="scan_qr">
      <section className="scan_qr_card">
        <div id="qr-gallery-reader" style={{ display: 'none' }} />
        <button
          type="button"
          className="scanner_back_button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>

        <ScanQRHeader />

        <QRScannerBox scanning={scanning} />

        <ScanQRInfo scanning={scanning} />

        {/* ERROR */}
        {error && <div className="scan_qr_error">{error}</div>}

        {showManual && (
          <ManualShopId
            manualId={manualId}
            onManualIdChange={setManualId}
            onSubmit={handleManualShopId}
          />
        )}

        <ScanQRActions
          scanning={scanning}
          onStart={() => {
            setShowManual(false);
            startQRScanner({
              scannerRef,
              setError,
              setScanning,
              extractShopId,
              stopScanner: () =>
                stopQRScanner({
                  scannerRef,
                  setScanning,
                }),
              navigate,
            });
          }}
          onStop={() =>
            stopQRScanner({
              scannerRef,
              setScanning,
            })
          }
        />

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

        <GalleryQRUpload scanning={scanning} onScan={handleGalleryScan} />
      </section>
    </main>
  );
}

export default ScanQR;
