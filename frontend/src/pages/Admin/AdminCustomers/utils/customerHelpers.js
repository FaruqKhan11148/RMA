export function formatCustomerDate(date) {
  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleString('en-IN');
}
