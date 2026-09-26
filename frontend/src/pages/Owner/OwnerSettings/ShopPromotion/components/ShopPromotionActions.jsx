function ShopPromotionActions({
  shopId,
  handleDownloadQR,
  handleDownloadPoster,
}) {
  return (
    <section className="shop-promotion-actions">
      <button
        className="shop-action-button primary"
        disabled={!shopId}
        onClick={handleDownloadQR}
      >
        Download QR
      </button>

      <button
        className="shop-action-button secondary"
        disabled={!shopId}
        onClick={handleDownloadPoster}
      >
        Download A4 Poster PDF
      </button>
    </section>
  );
}

export default ShopPromotionActions;
