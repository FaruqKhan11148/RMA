import { useLanguage } from '../../../context/LanguageContext';

function HomeHero({
  meatImages,
  optimizeCloudinaryImage,
  customerName,
  locationLoading,
  locationName,
  onLocationClick,
}) {
  const { t } = useLanguage();

  return (
    <section className="home_hero">
      <header className="rma_home_header">
        <button className="rma_location_button" onClick={onLocationClick}>
          <span className="rma_location_arrow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 19 14.5 19 9C19 5.134 15.866 2 12 2C8.134 2 5 5.134 5 9C5 14.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="9"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </span>

          <span className="rma_location_content">
            <span className="rma_location_label">DELIVERING TO</span>

            <span className="rma_location_value">
              {locationLoading
                ? 'Finding your location...'
                : 'Your current location'}
            </span>

            {locationName && (
              <span className="rma_location_name">{locationName}</span>
            )}
          </span>

          <span className="rma_location_chevron" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </header>

      {/* Sliding image track */}

      <div className="hero_image_track">
        {[...meatImages, meatImages[0]].map((image, index) => (
          <div className="hero_image" key={`${image}-${index}`}>
            <img
              src={optimizeCloudinaryImage(image, 1200)}
              alt={`Fresh meat ${(index % meatImages.length) + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'low'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Image overlay */}

      <div className="hero_overlay"></div>

      {/* Text placed ABOVE the images */}

      <div className="home_header">
        <div className="hero_badge">FRESH • LOCAL • CONVENIENT</div>

        <p className="home_greeting">
          {customerName ? `Hello ${customerName}` : 'Hello!'}
        </p>

        <h1>{t.home.title}</h1>

        <p>{t.home.description}</p>
      </div>

      <div className="hero_dots" aria-hidden="true">
        {meatImages.map((image, index) => (
          <span className="hero_dot" key={image}></span>
        ))}
      </div>
    </section>
  );
}

export default HomeHero;
