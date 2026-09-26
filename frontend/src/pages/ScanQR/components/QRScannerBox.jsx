function QRScannerBox({ scanning }) {
  return (
    <div className="qr_scanner_box">
      {!scanning && (
        <>
          <div className="scanner_corner top_left"></div>
          <div className="scanner_corner top_right"></div>
          <div className="scanner_corner bottom_left"></div>
          <div className="scanner_corner bottom_right"></div>

          <div className="scanner_placeholder">
            <span>QR</span>
            <p>Camera scanner</p>
          </div>
        </>
      )}

      <div id="qr-reader" className="qr_reader" />

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
  );
}

export default QRScannerBox;
