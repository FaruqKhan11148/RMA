import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const API_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/'
    : 'https://rma-backend-bo4a.onrender.com/';

function OwnerProtectedRoute() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const verifyOwner = async () => {
      const token = localStorage.getItem('rma_owner_token');

      if (!token) {
        if (active) {
          setAuthenticated(false);
          setCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}api/owners/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Owner authentication failed: HTTP ${response.status}`,
          );
        }

        const data = await response.json();

        if (!active) return;

        if (data.owner) {
          localStorage.setItem('rma_owner', JSON.stringify(data.owner));
        }

        setAuthenticated(true);
      } catch (error) {
        console.error('Owner authentication failed:', error);

        if (active) {
          // Preserve localStorage credentials while diagnosing the issue.
          setAuthenticated(false);
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    };

    verifyOwner();

    return () => {
      active = false;
    };
  }, []);

  if (checkingAuth) {
    return <div>Verifying owner session...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/owner/login" replace />;
  }

  return <Outlet />;
}

export default OwnerProtectedRoute;
