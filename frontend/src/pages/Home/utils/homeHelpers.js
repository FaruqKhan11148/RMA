export const RMA_LOCATION_KEY = 'rma_user_location';

export const optimizeCloudinaryImage = (url, width = 800) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto,w_${width},dpr_auto/`,
  );
};

export const getSavedLocation = () => {
  try {
    const saved = localStorage.getItem(RMA_LOCATION_KEY);

    if (!saved) {
      return null;
    }

    const parsedLocation = JSON.parse(saved);

    if (
      !Number.isFinite(parsedLocation.latitude) ||
      !Number.isFinite(parsedLocation.longitude)
    ) {
      localStorage.removeItem(RMA_LOCATION_KEY);
      return null;
    }

    return parsedLocation;
  } catch (error) {
    console.error('Failed to read saved location:', error);

    localStorage.removeItem(RMA_LOCATION_KEY);
    return null;
  }
};

export const saveLocation = (location) => {
  localStorage.setItem(RMA_LOCATION_KEY, JSON.stringify(location));
};

export const getLocationErrorMessage = (error) => {
  if (!error) {
    return 'Unable to get your location. Please try again.';
  }

  if (error.code === 1) {
    return 'Location permission is blocked. Please allow location access in your browser settings.';
  }

  if (error.code === 2) {
    return 'Unable to detect your location. Please try again.';
  }

  if (error.code === 3) {
    return 'Location is taking too long. Please try again.';
  }

  return 'Unable to get your location. Please try again.';
};

export const getPopularProducts = (nearbyShops) => {
  return nearbyShops
    .flatMap((shop) =>
      (shop.products || [])
        .filter((product) => product.available)
        .map((product) => ({
          ...product,
          shopId: shop.shopId,
          shopName: shop.shopName,
          shopDistance: shop.distance,
        })),
    )
    .slice(0, 8);
};

export const meatImages = [
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/HuNbApWSmQc9TvMcm31ZogyfUsbl1wA6KBdndBiI3vh39M_m0yUZ_1LGjXTrwgWIhIfew2gPb-PxXaVaTItYVcU6AUIulUU3xxDiVx0l7eYM8vlhvqM2tF91-JCYsZu8UgFgUhWezrFzcq94RvzhS9qW3mRmv40PHwwBH0puu9cuGlvFrSOSVkYJHL8pN_bl.jpg',
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692760/rYKkTplP1CFqmXNxxpnxvf_Da5-LkcRD6slxlBH3-HBpeo4Fro5mFCDNo2aYtNYwgiqm3PWXyPeb9L2ZbpmpeCDTv6oWbTmQHL6HUMbPzjcZeJ946-zJyqc0zRhVk6DioJTJYGsDTiHbRCP0qxHiyB68uTO9_HBdzGXNfK9EjMS1xqsJVuas22DpDLVbkTsL.jpg',
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692758/YXAoTCSnLmtzr1cckX1A5eVY1Jjq2McuzwVKDQEu9iZYeo3pUhak7P-ZI6LLTe82ZMh0j-7FwKo1Kx90mRJEdHyFKeh6cDEbpHII6zXFtWiH-m5Lon8EUPbVSaK9nCh7LuLOmtNMiNiqDfuJbp6NTI4JDs_yZiRtf0QVGZKrjwVN6xTVl2fepBv4FgMclLLx.jpg',
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692746/6zXPm-qeheg-DOSWSfukVpbtMS7NiICY8PecMbFXQl8Bhlg4IQQc_w4UqTpFPSSI0GAuIyJVFB0eLEtavNeKLtfLNbfRWbhfLJFVzXRJgEZncrjGJPHd8qr7WH4_s8ZBvxbbosN4pQ7_OiFXFrnR5B9EedXDp2w1rsanRh2CPM_tZ37HIWlMdVGgWF8b-Qsa.jpg',
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692737/HvH-wvV2Ns1JsiDwYYwiIYWBD_hqSX8kp1axRoAClbVhzgoWkE5TkikoHxnr2C0bQAw4aBUFLWycd27_90ebE8wSxKxrFrBI3SjSlEWRKqAxOQhgmSY4UWNMwVBfvq3JG4XYJmNwD3yDHiWKdGAJD3UzuZ2vrUT_oxr4PYw6Qc5cxr602P66rA5dFNzXo5SQ.jpg',
  'https://res.cloudinary.com/dsznfqgu3/image/upload/v1788692757/7W8FjPyWPZUer7tM7Vf1Ntr-yvriGGEZoIxfsb6GHEhWFboo2qh240DsoFOT6lZaT8sTSjQzIrUApTLiMrLG1Qs4HIRh1KZIL183xoSxb8VAWP7P_MJCjRWEa-bWvByIcPOgdtuoNUk3WtA5Fr0FONPBkkyp1ER2nJT-MRk6KSOU4Jur_0KCl5dejm-Nptwz.jpg',
];
