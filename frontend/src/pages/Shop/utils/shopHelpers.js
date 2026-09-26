export function isShopCurrentlyOpen(shop) {
  const openingTime = shop.deliverySettings?.openingTime;
  const closingTime = shop.deliverySettings?.closingTime;
  const shopStatusMode = shop.deliverySettings?.shopStatusMode;

  if (!openingTime || !closingTime) {
    return true;
  }

  if (shopStatusMode === 'open') {
    return true;
  }

  if (shopStatusMode === 'closed') {
    return false;
  }

  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openingHour, openingMinute] = openingTime.split(':').map(Number);
  const [closingHour, closingMinute] = closingTime.split(':').map(Number);

  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  if (openingMinutes > closingMinutes) {
    return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
  }

  return true;
}
