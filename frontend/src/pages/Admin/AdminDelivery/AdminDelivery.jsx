import './AdminDelivery.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDelivery() {
  const navigate = useNavigate();

  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // FETCH DELIVERY PERSONS
  useEffect(() => {
    const fetchDeliveryPersons = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'http://localhost:5000/api/admin/delivery',
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch delivery persons');
        }

        setDeliveryPersons(data.deliveryPersons || []);
      } catch (error) {
        console.error('Admin delivery fetch error:', error);
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPersons();
  }, [navigate]);

  // FILTER DELIVERY PERSONS
  const filteredDeliveryPersons = useMemo(() => {
    return deliveryPersons.filter((person) => {
      const owner = person.ownerId || {};

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        person.name?.toLowerCase().includes(searchText) ||
        person.phone?.toLowerCase().includes(searchText) ||
        person.shopId?.toLowerCase().includes(searchText) ||
        owner.shopName?.toLowerCase().includes(searchText) ||
        owner.ownerName?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && person.isActive) ||
        (statusFilter === 'INACTIVE' && !person.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [deliveryPersons, search, statusFilter]);

  // SUMMARY STATS
  const totalDeliveryPersons = deliveryPersons.length;

  const activeDeliveryPersons = deliveryPersons.filter(
    (person) => person.isActive,
  ).length;

  const inactiveDeliveryPersons = deliveryPersons.filter(
    (person) => !person.isActive,
  ).length;

  const totalDeliveryOrders = deliveryPersons.reduce(
    (total, person) => total + (person.totalDeliveryOrders || 0),
    0,
  );

  const completedDeliveries = deliveryPersons.reduce(
    (total, person) => total + (person.completedOrders || 0),
    0,
  );

  const activeDeliveries = deliveryPersons.reduce(
    (total, person) => total + (person.activeOrders || 0),
    0,
  );

  // OPEN DETAILS
  const handleViewDetails = async (person) => {
    try {
      setError('');

      const response = await fetch(
        `http://localhost:5000/api/admin/delivery/${person.shopId}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (response.status === 401) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch delivery person details',
        );
      }

      setSelectedPerson(data.deliveryPerson);
      setShowModal(true);
    } catch (error) {
      console.error('Delivery person details error:', error);
      setError(error.message || 'Failed to load details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPerson(null);
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';

      case 'OutForDelivery':
        return 'status-delivery';

      case 'Accepted':
        return 'status-accepted';

      case 'Preparing':
        return 'status-preparing';

      case 'Ready':
        return 'status-ready';

      case 'Rejected':
        return 'status-rejected';

      default:
        return 'status-pending';
    }
  };

  const getReadableStatus = (status) => {
    switch (status) {
      case 'OutForDelivery':
        return 'Out for Delivery';

      default:
        return status || 'Unknown';
    }
  };

  return (
    <div className="admin-delivery-page">
      {/* HEADER */}
      <div className="admin-delivery-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Dashboard
          </button>

          <h1>Delivery Management</h1>

          <p>
            Monitor delivery persons, active deliveries and completed
            deliveries.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="admin-delivery-error">{error}</div>}

      {/* STATS */}
      <div className="delivery-stats-grid">
        <div className="delivery-stat-card">
          <span>Total Delivery Persons</span>
          <strong>{totalDeliveryPersons}</strong>
        </div>

        <div className="delivery-stat-card">
          <span>Active Persons</span>
          <strong>{activeDeliveryPersons}</strong>
        </div>

        <div className="delivery-stat-card">
          <span>Inactive Persons</span>
          <strong>{inactiveDeliveryPersons}</strong>
        </div>

        <div className="delivery-stat-card">
          <span>Active Deliveries</span>
          <strong>{activeDeliveries}</strong>
        </div>

        <div className="delivery-stat-card">
          <span>Completed Deliveries</span>
          <strong>{completedDeliveries}</strong>
        </div>

        <div className="delivery-stat-card">
          <span>Total Delivery Orders</span>
          <strong>{totalDeliveryOrders}</strong>
        </div>
      </div>

      {/* FILTERS */}
      <div className="delivery-controls">
        <input
          type="text"
          placeholder="Search delivery person, shop, owner, phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Persons</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="delivery-loading">Loading delivery persons...</div>
      ) : filteredDeliveryPersons.length === 0 ? (
        <div className="delivery-empty">
          <h3>No delivery persons found</h3>
          <p>No delivery person matches the current search or filter.</p>
        </div>
      ) : (
        <div className="delivery-table-wrapper">
          <table className="delivery-table">
            <thead>
              <tr>
                <th>Delivery Person</th>
                <th>Shop</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Active Orders</th>
                <th>Completed</th>
                <th>Total Orders</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeliveryPersons.map((person) => {
                const owner = person.ownerId || {};

                return (
                  <tr key={person._id}>
                    <td>
                      <div className="delivery-person-cell">
                        <strong>{person.name}</strong>
                        <span>{person.shopId}</span>
                      </div>
                    </td>

                    <td>{owner.shopName || '—'}</td>

                    <td>{owner.ownerName || '—'}</td>

                    <td>{person.phone || '—'}</td>

                    <td>
                      <span className="order-count active">
                        {person.activeOrders || 0}
                      </span>
                    </td>

                    <td>
                      <span className="order-count completed">
                        {person.completedOrders || 0}
                      </span>
                    </td>

                    <td>{person.totalDeliveryOrders || 0}</td>

                    <td>
                      <span
                        className={
                          person.isActive
                            ? 'delivery-status active'
                            : 'delivery-status inactive'
                        }
                      >
                        {person.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-delivery-button"
                        onClick={() => handleViewDetails(person)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showModal && selectedPerson && (
        <div className="delivery-modal-overlay" onClick={closeModal}>
          <div
            className="delivery-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="delivery-modal-header">
              <div>
                <h2>{selectedPerson.name}</h2>

                <p>Delivery Person • {selectedPerson.shopId}</p>
              </div>

              <button className="modal-close-button" onClick={closeModal}>
                ×
              </button>
            </div>

            {/* PERSON INFO */}
            <div className="delivery-detail-section">
              <h3>Delivery Person</h3>

              <div className="delivery-detail-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedPerson.name}</strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>{selectedPerson.phone}</strong>
                </div>

                <div>
                  <span>Shop ID</span>
                  <strong>{selectedPerson.shopId}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedPerson.isActive ? 'Active' : 'Inactive'}
                  </strong>
                </div>

                <div>
                  <span>Registered</span>
                  <strong>{formatDate(selectedPerson.createdAt)}</strong>
                </div>

                <div>
                  <span>Last Updated</span>
                  <strong>{formatDate(selectedPerson.updatedAt)}</strong>
                </div>
              </div>
            </div>

            {/* SHOP / OWNER */}
            <div className="delivery-detail-section">
              <h3>Shop & Owner</h3>

              <div className="delivery-detail-grid">
                <div>
                  <span>Shop</span>
                  <strong>{selectedPerson.ownerId?.shopName || '—'}</strong>
                </div>

                <div>
                  <span>Shop ID</span>
                  <strong>{selectedPerson.ownerId?.shopId || '—'}</strong>
                </div>

                <div>
                  <span>Owner</span>
                  <strong>{selectedPerson.ownerId?.ownerName || '—'}</strong>
                </div>

                <div>
                  <span>Owner Phone</span>
                  <strong>{selectedPerson.ownerId?.phone || '—'}</strong>
                </div>
              </div>
            </div>

            {/* DELIVERY SUMMARY */}
            <div className="delivery-detail-section">
              <h3>Delivery Summary</h3>

              <div className="delivery-summary-grid">
                <div>
                  <span>Active</span>
                  <strong>{selectedPerson.activeOrders || 0}</strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>{selectedPerson.completedOrders || 0}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{selectedPerson.totalDeliveryOrders || 0}</strong>
                </div>
              </div>
            </div>

            {/* ORDER HISTORY */}
            <div className="delivery-detail-section">
              <h3>Delivery Order History</h3>

              {!selectedPerson.orders || selectedPerson.orders.length === 0 ? (
                <div className="no-delivery-orders">
                  No delivery orders found.
                </div>
              ) : (
                <div className="delivery-order-list">
                  {selectedPerson.orders.map((order) => (
                    <div className="delivery-order-card" key={order._id}>
                      <div className="delivery-order-top">
                        <div>
                          <strong>{order.orderId}</strong>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>

                        <span
                          className={`order-status ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {getReadableStatus(order.status)}
                        </span>
                      </div>

                      <div className="delivery-order-info">
                        <div>
                          <span>Customer</span>
                          <strong>{order.customer?.name || '—'}</strong>
                        </div>

                        <div>
                          <span>Phone</span>
                          <strong>{order.customer?.phone || '—'}</strong>
                        </div>

                        <div>
                          <span>Amount</span>
                          <strong>
                            ₹{Number(order.totalPrice || 0).toFixed(2)}
                          </strong>
                        </div>

                        <div>
                          <span>Payment</span>
                          <strong>{order.paymentStatus || 'Pending'}</strong>
                        </div>

                        <div>
                          <span>Payment Method</span>
                          <strong>{order.paymentMethod || '—'}</strong>
                        </div>

                        <div>
                          <span>OTP</span>
                          <strong>
                            {order.otpVerified
                              ? 'Verified'
                              : order.deliveryOtpGeneratedAt
                                ? 'Generated'
                                : 'Not Generated'}
                          </strong>
                        </div>
                      </div>

                      {/* ORDER TIMELINE */}
                      <div className="delivery-order-timeline">
                        <div>
                          <span>Accepted</span>
                          <strong>{formatDate(order.acceptedAt)}</strong>
                        </div>

                        <div>
                          <span>Preparing</span>
                          <strong>{formatDate(order.preparingAt)}</strong>
                        </div>

                        <div>
                          <span>Ready</span>
                          <strong>{formatDate(order.readyAt)}</strong>
                        </div>

                        <div>
                          <span>Out for Delivery</span>
                          <strong>{formatDate(order.outForDeliveryAt)}</strong>
                        </div>

                        <div>
                          <span>Completed</span>
                          <strong>{formatDate(order.completedAt)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CLOSE */}
            <div className="delivery-modal-footer">
              <button className="modal-footer-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDelivery;
