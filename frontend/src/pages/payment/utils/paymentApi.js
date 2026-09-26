const API_URL = 'https://rma-backend-bo4a.onrender.com/';

export const createPayUPayment = async (orderId) => {
  const response = await fetch(`${API_URL}api/payments/create-order`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      orderId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to create payment');
  }

  console.log('PayU Payment Data:', data);

  const { paymentUrl, payment } = data;

  if (!paymentUrl || !payment) {
    throw new Error('Invalid PayU payment response');
  }

  return {
    paymentUrl,
    payment,
  };
};

export const submitPayUPayment = (paymentUrl, payment) => {
  const form = document.createElement('form');

  form.method = 'POST';
  form.action = paymentUrl;

  form.style.display = 'none';

  const paymentFields = {
    key: payment.key,
    txnid: payment.txnid,
    amount: payment.amount,
    productinfo: payment.productinfo,
    firstname: payment.firstname,
    email: payment.email,
    phone: payment.phone,
    surl: payment.surl,
    furl: payment.furl,
    hash: payment.hash,
  };

  Object.entries(paymentFields).forEach(([name, value]) => {
    const input = document.createElement('input');

    input.type = 'hidden';
    input.name = name;
    input.value = value ?? '';

    form.appendChild(input);
  });

  document.body.appendChild(form);

  console.log('Redirecting to PayU Test Checkout...');

  form.submit();
};
