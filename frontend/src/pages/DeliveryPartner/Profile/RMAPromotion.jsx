import './RMAPromotion.css';

function RMAPromotion() {
  return (
    <section className="rma_promotion">
      <div className="rma_promotion_intro">
        <span className="rma_promotion_eyebrow">YOUR LOCAL SHOP, ONLINE!</span>

        <h2>Fresh meat. Local shops. Easy ordering.</h2>

        <p>
          Support your local meat shop and order fresh meat and seafood
          conveniently through RMA.
        </p>
      </div>

      <div className="rma_promotion_poster">
        <img
          src="/images/rma-promotion-poster.png"
          alt="RMA — Order online from your local shop. Scan to order online."
          loading="lazy"
        />
      </div>
    </section>
  );
}

export default RMAPromotion;
