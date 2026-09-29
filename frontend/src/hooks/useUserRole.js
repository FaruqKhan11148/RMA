import { useEffect, useState } from 'react';

function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const detectRole = async () => {
      // 1. Owner
      const storedOwner = localStorage.getItem('rma_owner');

      if (storedOwner) {
        try {
          JSON.parse(storedOwner);

          if (!cancelled) {
            setRole('owner');
            setLoading(false);
          }

          return;
        } catch (error) {
          console.error('Invalid owner session:', error);

          localStorage.removeItem('rma_owner');
          localStorage.removeItem('rma_owner_token');
        }
      }

      // 2. Delivery Partner
      const deliveryToken = sessionStorage.getItem('delivery_token');
      const storedDeliveryPerson = sessionStorage.getItem('delivery_person');

      if (deliveryToken && storedDeliveryPerson) {
        try {
          JSON.parse(storedDeliveryPerson);

          if (!cancelled) {
            setRole('delivery');
            setLoading(false);
          }

          return;
        } catch (error) {
          console.error('Invalid delivery session:', error);

          sessionStorage.removeItem('delivery_token');
          sessionStorage.removeItem('delivery_person');
        }
      }

      // 3. Customer
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (response.ok) {
          const data = await response.json();

          if (data.customer) {
            if (!cancelled) {
              setRole('customer');
              setLoading(false);
            }

            return;
          }
        }
      } catch (error) {
        console.error('Customer role check failed:', error);
      }

      // 4. Guest
      if (!cancelled) {
        setRole('guest');
        setLoading(false);
      }
    };

    detectRole();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    role,
    loading,
  };
}

export default useUserRole;
