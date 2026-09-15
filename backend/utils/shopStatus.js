const getShopStatus = (owner) => {
  const {
    shopStatusMode = 'auto',
    openingTime = '10:00',
    closingTime = '22:00',
  } = owner.deliverySettings || {};

  if (shopStatusMode === 'open') {
    return true;
  }

  if (shopStatusMode === 'closed') {
    return false;
  }

  const now = new Date();

  const indiaTime = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const [currentHour, currentMinute] = indiaTime.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMinute;

  const [openHour, openMinute] = openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = closingTime.split(':').map(Number);

  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;

  if (owner.statusOverride !== 'none' && owner.statusOverrideAt) {
    const overrideDate = new Date(owner.statusOverrideAt);

    const overrideIndiaDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(overrideDate);

    const currentIndiaDate = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    if (overrideIndiaDate === currentIndiaDate) {
      if (owner.statusOverride === 'closed') {
        return false;
      }

      if (owner.statusOverride === 'open') {
        if (openingMinutes < closingMinutes) {
          return currentMinutes < closingMinutes;
        }

        if (openingMinutes > closingMinutes) {
          return (
            currentMinutes >= openingMinutes || currentMinutes < closingMinutes
          );
        }

        return true;
      }
    }
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  if (openingMinutes > closingMinutes) {
    return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
  }

  return true;
};

module.exports = getShopStatus;
