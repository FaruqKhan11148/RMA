import './AdminCustomers.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminCustomers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'http://localhost:5000api/admin/customers',
          {
            credentials: 'include',
          },
        );

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch customers');
        }

        setCustomers(data.customers || []);
      } catch (err) {
        console.error('Admin customers error:', err);
        setError(err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate]);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(value) ||
        customer.phone?.toLowerCase().includes(value) ||
        customer.address?.toLowerCase().includes(value) ||
        customer.deliveryLocation?.address?.toLowerCase().includes(value)
      );
    });
  }, [customers, search]);

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString('en-IN');
  };

  const getCustomerStatus = (customer) => {
    const hasActiveOrder = customer.orders?.some(
      (order) => order.status !== 'Completed' && order.status !== 'Rejected',
    );

    return hasActiveOrder ? 'Active Order' : 'Customer';
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
      <div className="admin-customers-header">
        <div>
          <h1>Customers</h1>
          <p>View customers and their complete RMA order history.</p>
        </div>

        <button
          className="admin-customers-back-btn"
          onClick={() => navigate('/admin/dashboard')}
        >
          Dashboard
        </button>
      </div>

      {error && <div className="admin-customers-error">{error}</div>}

      <div className="admin-customers-stats">
        <div className="admin-customer-stat-card">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div className="admin-customer-stat-card">
          <span>Customers With Orders</span>
          <strong>
            {customers.filter((customer) => customer.totalOrders > 0).length}
          </strong>
        </div>

        <div className="admin-customer-stat-card">
          <span>Total Orders</span>
          <strong>
            {customers.reduce(
              (total, customer) => total + (customer.totalOrders || 0),
              0,
            )}
          </strong>
        </div>

        <div className="admin-customer-stat-card">
          <span>Total Paid Amount</span>
          <strong>
            ₹
            {customers
              .reduce(
                (total, customer) => total + (customer.totalSpent || 0),
                0,
              )
              .toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      <div className="admin-customers-toolbar">
        <input
          type="text"
          placeholder="Search name, phone, address..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <span>
          Showing {filteredCustomers.length} of {customers.length}
        </span>
      </div>

      <div className="admin-customers-table-wrapper">
        <table className="admin-customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Paid Amount</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-customers-empty">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.phone}>
                  <td>
                    <div className="admin-customer-name">
                      {customer.name || 'Unknown'}
                    </div>
                  </td>

                  <td>{customer.phone}</td>

                  <td>
                    <div className="admin-customer-location">
                      {customer.deliveryLocation?.address ||
                        customer.address ||
                        '-'}
                    </div>
                  </td>

                  <td>{customer.totalOrders}</td>

                  <td>₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</td>

                  <td>{formatDate(customer.lastOrderAt)}</td>

                  <td>
                    <span
                      className={
                        getCustomerStatus(customer) === 'Active Order'
                          ? 'customer-status active'
                          : 'customer-status'
                      }
                    >
                      {getCustomerStatus(customer)}
                    </span>
                  </td>

                  <td>
                    <button
                      className="admin-customer-view-btn"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div
          className="admin-customer-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="admin-customer-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-customer-modal-header">
              <div>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.phone}</p>
              </div>

              <button
                className="admin-customer-close-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-customer-details">
              <div className="customer-detail-card">
                <span>Phone</span>
                <strong>{selectedCustomer.phone}</strong>
              </div>

              <div className="customer-detail-card">
                <span>Total Orders</span>
                <strong>{selectedCustomer.totalOrders}</strong>
              </div>

              <div className="customer-detail-card">
                <span>Total Paid</span>
                <strong>
                  ₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div className="customer-detail-card">
                <span>Last Order</span>
                <strong>{formatDate(selectedCustomer.lastOrderAt)}</strong>
              </div>
            </div>

            <div className="admin-customer-address-section">
              <h3>Customer Address</h3>

              <p>{selectedCustomer.address || 'No address'}</p>

              <h3>Delivery Location</h3>

              <p>
                {selectedCustomer.deliveryLocation?.address ||
                  'No delivery address'}
              </p>

              {selectedCustomer.deliveryLocation?.latitude &&
                selectedCustomer.deliveryLocation?.longitude && (
                  <p>
                    Coordinates: {selectedCustomer.deliveryLocation.latitude},{' '}
                    {selectedCustomer.deliveryLocation.longitude}
                  </p>
                )}
            </div>

            <div className="admin-customer-orders-section">
              <h3>Order History</h3>

              <div className="admin-customer-orders">
                {selectedCustomer.orders?.map((order) => (
                  <div
                    className="admin-customer-order-card"
                    key={order.orderId}
                  >
                    <div>
                      <strong>{order.orderId}</strong>

                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div>
                      <strong>
                        ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                      </strong>

                      <span
                        className={`customer-payment-status ${order.paymentStatus.toLowerCase()}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`customer-order-status ${order.status
                          .toLowerCase()
                          .replace(/\s/g, '-')}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
