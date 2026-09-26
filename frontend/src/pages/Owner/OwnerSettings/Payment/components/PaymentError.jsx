function PaymentError({ error }) {
  if (!error) {
    return null;
  }

  return <div className="owner_setting_error">{error}</div>;
}

export default PaymentError;
