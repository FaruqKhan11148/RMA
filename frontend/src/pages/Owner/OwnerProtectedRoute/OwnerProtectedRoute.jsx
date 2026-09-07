import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

function OwnerProtectedRoute() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const verifyOwner = async () => {
      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        setAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Owner authentication failed');
        }

        const data = await response.json();

        // Keep owner information fresh after refresh
        if (data.owner) {
          localStorage.setItem('rma_owner', JSON.stringify(data.owner));
        }

        setAuthenticated(true);
      } catch (error) {
        console.error('Owner authentication failed:', error);

        localStorage.removeItem('rma_owner');
        localStorage.removeItem('rma_owner_token');

        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyOwner();
  }, []);

  if (checkingAuth) {
    return (
      <main>
        <p>Checking owner session...</p>
      </main>
    );
  }

  if (!authenticated) {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
}

export default OwnerProtectedRoute;
