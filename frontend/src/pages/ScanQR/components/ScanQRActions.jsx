function ScanQRActions({ scanning, onStart, onStop }) {
  return (
    <div className="scan_qr_actions">
      {!scanning ? (
        <button type="button" className="scan_qr_manual" onClick={onStart}>
          Start Camera
        </button>
      ) : (
        <button
          type="button"
          className="scan_qr_manual scan_qr_stop"
          onClick={onStop}
        >
          Stop Camera
        </button>
      )}
    </div>
  );
}

export default ScanQRActions;
