import './AdminCustomers.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CustomersHeader from './components/CustomersHeader';
import CustomersStats from './components/CustomersStats';
import CustomersToolbar from './components/CustomersToolbar';
import CustomersTable from './components/CustomersTable';
import CustomerDetailsModal from './components/CustomerDetailsModal';

import { filterCustomers } from './utils/customerFilters';
import { formatCustomerDate } from './utils/customerHelpers';
import { fetchCustomers, fetchCustomerDetails } from './utils/customerApi';

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  const [customerDetailsError, setCustomerDetailsError] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        setError('');

        const customerList = await fetchCustomers();

        setCustomers(customerList);
      } catch (err) {
        console.error('Admin customers error:', err);

        if (err.status === 401) {
          navigate('/admin/login');
          return;
        }

        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [navigate]);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, search),
    [customers, search],
  );

  const handleViewCustomer = async (phone) => {
    try {
      setCustomerDetailsLoading(true);
      setCustomerDetailsError('');

      const data = await fetchCustomerDetails(phone);

      setSelectedCustomer({
        ...data.customer,
        ...data.stats,
        orders: data.orders,
      });
    } catch (err) {
      console.error('Admin customer details error:', err);

      if (err.status === 401) {
        navigate('/admin/login');
        return;
      }

      setCustomerDetailsError(err.message || 'Failed to load customer details');
    } finally {
      setCustomerDetailsLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="admin-customers-page">
        <div className="admin-customers-loading">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="admin-customers-page">
      <CustomersHeader onBack={() => navigate('/admin/dashboard')} />

      {error && <div className="admin-customers-error">{error}</div>}

      <CustomersStats customers={customers} />

      <CustomersToolbar
        search={search}
        onSearchChange={setSearch}
        filteredCount={filteredCustomers.length}
        totalCount={customers.length}
      />

      <CustomersTable
        customers={filteredCustomers}
        onViewCustomer={handleViewCustomer}
        customerDetailsLoading={customerDetailsLoading}
        formatDate={formatCustomerDate}
      />

      <CustomerDetailsModal
        customer={selectedCustomer}
        error={customerDetailsError}
        onClose={() => {
          setSelectedCustomer(null);
          setCustomerDetailsError('');
        }}
        onViewOrder={handleViewOrder}
        formatDate={formatCustomerDate}
      />
    </div>
  );
}

export default AdminCustomers;
