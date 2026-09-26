function GalleryQRUpload({ scanning, onScan }) {
  if (scanning) {
    return null;
  }

  return (
    <>
      <label htmlFor="qr-gallery-input" className="gallery_qr_button">
        Upload From Gallery
      </label>

      <input
        id="qr-gallery-input"
        type="file"
        accept="image/*"
        onChange={onScan}
        style={{ display: 'none' }}
      />
    </>
  );
}

export default GalleryQRUpload;
