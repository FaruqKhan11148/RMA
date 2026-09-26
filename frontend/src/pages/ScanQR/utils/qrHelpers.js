export function extractShopId(value) {
  if (!value) {
    return null;
  }

  const text = value.trim();

  if (/^RMA-\d+$/i.test(text)) {
    return text.toUpperCase();
  }

  try {
    const url = new URL(text);

    const parts = url.pathname.split('/').filter(Boolean);

    const shopIndex = parts.findIndex((part) => part.toLowerCase() === 'shop');

    if (shopIndex !== -1 && parts[shopIndex + 1]) {
      const shopId = parts[shopIndex + 1];

      if (/^RMA-\d+$/i.test(shopId)) {
        return shopId.toUpperCase();
      }
    }
  } catch (error) {
    // Not a URL.
  }

  const match = text.match(/RMA-\d+/i);

  if (match) {
    return match[0].toUpperCase();
  }

  return null;
}

export function validateShopId(value) {
  const shopId = value.trim().toUpperCase();

  if (!shopId) {
    return {
      valid: false,
      shopId: null,
      error: 'Please enter a shop ID.',
    };
  }

  if (!/^RMA-\d+$/.test(shopId)) {
    return {
      valid: false,
      shopId: null,
      error: 'Please enter a valid RMA shop ID, for example RMA-000005.',
    };
  }

  return {
    valid: true,
    shopId,
    error: '',
  };
}
