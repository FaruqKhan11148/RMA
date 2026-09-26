export const clearOwnerSession = () => {
  localStorage.removeItem('rma_owner');
  localStorage.removeItem('rma_owner_token');
};

export const clearDeliverySession = () => {
  sessionStorage.removeItem('delivery_token');
  sessionStorage.removeItem('delivery_person');
};

export const getStoredOwner = () => {
  const storedOwner = localStorage.getItem('rma_owner');

  if (!storedOwner) {
    return null;
  }

  try {
    return JSON.parse(storedOwner);
  } catch (error) {
    console.error('Invalid owner session:', error);
    clearOwnerSession();
    return null;
  }
};

export const getStoredDeliveryPerson = () => {
  const deliveryToken = sessionStorage.getItem('delivery_token');
  const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

  if (!deliveryToken || !storedDeliveryPerson) {
    return null;
  }

  try {
    return JSON.parse(storedDeliveryPerson);
  } catch (error) {
    console.error('Invalid delivery session:', error);
    clearDeliverySession();
    return null;
  }
};

export const clearCustomerSession = (setCustomer) => {
  setCustomer(null);
};

export const clearOwnerState = (setOwner) => {
  clearOwnerSession();
  setOwner(null);
};

export const clearDeliveryState = (setDeliveryPerson) => {
  clearDeliverySession();
  setDeliveryPerson(null);
};
