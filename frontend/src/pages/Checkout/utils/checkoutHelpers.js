export const calculatePayuPricing = (totalPrice, deliveryCharge) => {
  const baseAmount = Number(totalPrice) + Number(deliveryCharge);

  const payuFee = Number((baseAmount * 0.02).toFixed(2));

  const payuGst = Number((payuFee * 0.18).toFixed(2));

  const payuCharges = Number((payuFee + payuGst).toFixed(2));

  const customerPayableAmount = Number((baseAmount + payuCharges).toFixed(2));

  return {
    baseAmount,
    payuFee,
    payuGst,
    payuCharges,
    customerPayableAmount,
  };
};
