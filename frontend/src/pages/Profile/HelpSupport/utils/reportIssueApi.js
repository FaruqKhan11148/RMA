const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

export const submitSupportIssue = async ({
  issueType,
  orderId,
  description,
}) => {
  const response = await fetch(`${API_URL}api/customers/support-issues`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      issueType,
      orderId: orderId.trim(),
      description: description.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to submit report');
  }

  return data;
};
