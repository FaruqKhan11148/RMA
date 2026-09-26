export const RMA_LOCATION_KEY = 'rma_user_location';

export const getSavedLocation = () => {
  const savedLocation = localStorage.getItem(RMA_LOCATION_KEY);

  if (!savedLocation) {
    return null;
  }

  try {
    return JSON.parse(savedLocation);
  } catch (error) {
    console.error('Saved location parse error:', error);

    localStorage.removeItem(RMA_LOCATION_KEY);

    return null;
  }
};

export const saveLocation = ({ latitude, longitude, locationName }) => {
  const locationData = {
    latitude,
    longitude,
  };

  if (locationName) {
    locationData.locationName = locationName;
  }

  localStorage.setItem(RMA_LOCATION_KEY, JSON.stringify(locationData));
};

export const getLocationErrorMessage = (code) => {
  if (code === 1) {
    return 'Location permission is blocked. Please allow location access in your browser settings.';
  }

  if (code === 2) {
    return 'Unable to detect your location. Please try again.';
  }

  if (code === 3) {
    return 'Location is taking too long. Please try again.';
  }

  return 'Unable to get your location. Please try again.';
};
