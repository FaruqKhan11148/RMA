import { Html5Qrcode } from 'html5-qrcode';

export async function startQRScanner({
  scannerRef,
  setError,
  setScanning,
  extractShopId,
  stopScanner,
  navigate,
}) {
  setError('');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          ideal: 'environment',
        },
      },
    });

    stream.getTracks().forEach((track) => track.stop());

    const scanner = new Html5Qrcode('qr-reader');

    scannerRef.current = scanner;

    setScanning(true);

    await scanner.start(
      {
        facingMode: 'environment',
      },
      {
        fps: 10,
        qrbox: {
          width: 220,
          height: 220,
        },
        aspectRatio: 1,
      },
      async (decodedText) => {
        console.log('QR Scanned:', decodedText);

        const shopId = extractShopId(decodedText);

        await stopScanner();

        if (!shopId) {
          setError('Invalid RMA shop QR code.');
          return;
        }

        localStorage.setItem('rma_trusted_shop_id', shopId);

        navigate(`/shop/${shopId}`);
      },
      () => {
        // Ignore frames where no QR code is detected.
      },
    );
  } catch (err) {
    console.error('QR camera error:', err);

    setScanning(false);

    if (err?.name === 'NotAllowedError') {
      setError(
        'Camera permission was denied. Please allow camera access in your browser settings and try again.',
      );
    } else if (err?.name === 'NotFoundError') {
      setError('No camera was found on this device.');
    } else if (err?.name === 'NotReadableError') {
      setError('Your camera is currently being used by another application.');
    } else if (err?.name === 'SecurityError') {
      setError(
        'Camera access is blocked because this page is not using a secure connection.',
      );
    } else {
      setError(
        'Unable to access your camera. Please check your browser camera permission and try again.',
      );
    }
  }
}

export async function stopQRScanner({ scannerRef, setScanning }) {
  if (!scannerRef.current) {
    return;
  }

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
}

export function cleanupQRScanner(scannerRef) {
  const scanner = scannerRef.current;

  if (!scanner) {
    return;
  }

  if (scanner.isScanning) {
    scanner
      .stop()
      .catch(() => {})
      .finally(() => {
        scanner.clear().catch(() => {});
      });
  } else {
    scanner.clear().catch(() => {});
  }

  scannerRef.current = null;
}

export async function scanQRFromGallery({
  file,
  setError,
  extractShopId,
  navigate,
}) {
  try {
    const scanner = new Html5Qrcode('qr-gallery-reader');

    const decodedText = await scanner.scanFile(file, true);

    console.log('QR Scanned From Gallery:', decodedText);

    await scanner.clear();

    const shopId = extractShopId(decodedText);

    if (!shopId) {
      setError('Invalid RMA shop QR code.');
      return;
    }

    localStorage.setItem('rma_trusted_shop_id', shopId);

    navigate(`/shop/${shopId}`);
  } catch (err) {
    console.error('Gallery QR scan error:', err);

    setError(
      'No valid QR code was found in this image. Please select a clear photo of an RMA shop QR code.',
    );
  }
}
