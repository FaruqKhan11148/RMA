import { Navigate, Outlet } from 'react-router-dom';

function RmaApplicationProtectedRoute() {
  const token = localStorage.getItem('delivery_token');
  const deliveryPerson = localStorage.getItem('delivery_person');

  if (!token || !deliveryPerson) {
    return <Navigate to="/delivery/rma-login" replace />;
  }

  try {
    const parsedDeliveryPerson = JSON.parse(deliveryPerson);

    if (parsedDeliveryPerson.deliveryType !== 'RMA') {
      localStorage.removeItem('delivery_token');
      localStorage.removeItem('delivery_person');

      return <Navigate to="/delivery/rma-login" replace />;
    }
  } catch (error) {
    console.error('Invalid RMA delivery person data:', error);

    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_person');

    return <Navigate to="/delivery/rma-login" replace />;
  }

  return <Outlet />;
}

export default RmaApplicationProtectedRoute;
