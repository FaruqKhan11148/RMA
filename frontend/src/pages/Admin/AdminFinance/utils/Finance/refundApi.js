const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

async function refundRequest(path, options = {}) {
  const response = await fetch(`${API_URL}api/admin/finance${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Refund request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function fetchRefundRequests() {
  const data = await refundRequest('/refunds');
  return data.refunds || data.requests || [];
}

export async function updateRefundStatus(refundId, payload) {
  return refundRequest(`/refunds/${encodeURIComponent(refundId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
