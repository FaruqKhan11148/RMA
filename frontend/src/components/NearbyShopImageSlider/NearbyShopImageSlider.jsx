import { useEffect, useState } from 'react';

const COMMON_SHOP_IMAGE =
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1789550262/Gemini_Generated_Image_2u7tlf2u7tlf2u7t.png';

const optimizeCloudinaryImage = (url, width = 800) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto,w_${width},dpr_auto/`,
  );
};

function NearbyShopImageSlider({ shop }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const availableProducts = (shop.products || []).filter(
    (product) => product.available && product.imageUrl,
  );

  useEffect(() => {
    if (availableProducts.length <= 1) {
      return undefined;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (previousIndex) => (previousIndex + 1) % availableProducts.length,
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [availableProducts.length]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [shop.shopId]);

  if (availableProducts.length === 0) {
    return (
      <div className="nearby_shop_image">
        <img src={COMMON_SHOP_IMAGE} alt={shop.shopName} />
      </div>
    );
  }

  return (
    <div className="nearby_shop_image">
      <div
        className="nearby_shop_image_track"
        style={{
          width: `${availableProducts.length * 100}%`,
          transform: `translateX(-${
            currentImageIndex * (100 / availableProducts.length)
          }%)`,
        }}
      >
        {availableProducts.map((product) => (
          <div
            className="nearby_shop_image_slide"
            key={product.productId}
            style={{
              width: `${100 / availableProducts.length}%`,
            }}
          >
            <img
              src={optimizeCloudinaryImage(product.imageUrl, 600)}
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      <span className="nearby_shop_product_name">
        {availableProducts[currentImageIndex].name}
      </span>

      {availableProducts.length > 1 && (
        <div className="nearby_shop_image_dots">
          {availableProducts.map((product, index) => (
            <span
              key={product.productId}
              className={
                index === currentImageIndex
                  ? 'nearby_shop_image_dot active'
                  : 'nearby_shop_image_dot'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NearbyShopImageSlider;
