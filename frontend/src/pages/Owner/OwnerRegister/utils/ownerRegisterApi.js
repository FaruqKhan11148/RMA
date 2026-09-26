async function registerOwner(ownerData) {
  const response = await fetch(
    'https://rma-backend-bo4a.onrender.com/api/owners/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ownerData),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Owner registration failed');
  }

  return data;
}

export default registerOwner;
