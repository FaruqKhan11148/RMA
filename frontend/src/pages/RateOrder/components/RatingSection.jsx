function RatingSection({ title, description, rating, setRating }) {
  return (
    <section className="rating_section">
      <h2>{title}</h2>

      <p>{description}</p>

      <div className="rating_stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`rating_star ${star <= rating ? 'active' : ''}`}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        ))}
      </div>
    </section>
  );
}

export default RatingSection;
