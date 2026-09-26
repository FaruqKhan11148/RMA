export const optimizeCloudinaryImage = (url, width = 400) => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  return url.replace(
    '/image/upload/',
    `/image/upload/f_auto,q_auto,w_${width},dpr_auto/`,
  );
};
