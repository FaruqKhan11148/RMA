function ScanQRInfo({ scanning }) {
  return (
    <div className="scan_qr_info">
      <h2>{scanning ? 'Scanning for shop QR...' : 'Ready to scan'}</h2>

      <p>
        {scanning
          ? 'Point your camera at the QR code provided by the shop.'
          : 'Tap the button below to activate your camera.'}
      </p>
    </div>
  );
}

export default ScanQRInfo;
