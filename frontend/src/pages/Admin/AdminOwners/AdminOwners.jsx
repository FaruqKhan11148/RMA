import './AdminOwners.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminOwners() {
  const navigate = useNavigate();

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('http://localhost:5000api/admin/owners', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/admin/login', { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch owners');
        }

        setOwners(data.owners || []);
      } catch (error) {
        console.error('Fetch owners error:', error);

        setError(error.message || 'Unable to load owners');
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, [navigate]);

  const filteredOwners = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return owners;
    }

    return owners.filter((owner) => {
      return (
        owner.shopId?.toLowerCase().includes(searchValue) ||
        owner.ownerName?.toLowerCase().includes(searchValue) ||
        owner.shopName?.toLowerCase().includes(searchValue) ||
        owner.phone?.toLowerCase().includes(searchValue) ||
        owner.email?.toLowerCase().includes(searchValue)
      );
    });
  }, [owners, search]);

  if (loading) {
    return <div className="admin-page-loading">Loading owners...</div>;
  }

  return (
    <div className="admin-owners-page">
      <div className="admin-page-header">
        <div>
          <h1>Shop Owners</h1>

          <p>Manage and monitor all registered RMA shops.</p>
        </div>

        <div className="admin-owner-count">{owners.length} registered</div>
      </div>

      {error && <div className="admin-page-error">{error}</div>}

      <div className="admin-owner-toolbar">
        <input
          type="text"
          placeholder="Search owner, shop or Shop ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>
          Showing {filteredOwners.length} of {owners.length}
        </span>
      </div>

      <div className="admin-owner-table-container">
        <table className="admin-owner-table">
          <thead>
            <tr>
              <th>Shop ID</th>
              <th>Owner</th>
              <th>Shop</th>
              <th>Phone</th>
              <th>Products</th>
              <th>Services</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredOwners.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty-state">
                  No owners found.
                </td>
              </tr>
            ) : (
              filteredOwners.map((owner) => (
                <tr key={owner._id}>
                  <td>
                    <strong>{owner.shopId || '—'}</strong>
                  </td>

                  <td>{owner.ownerName || '—'}</td>

                  <td>{owner.shopName || '—'}</td>

                  <td>{owner.phone || '—'}</td>

                  <td>{owner.products?.length || 0}</td>

                  <td>
                    <div className="admin-service-badges">
                      {owner.delivery && <span>Delivery</span>}

                      {owner.pickup && <span>Pickup</span>}
                    </div>
                  </td>

                  <td>
                    <span
                      className={
                        owner.isOpen
                          ? 'owner-status open'
                          : 'owner-status closed'
                      }
                    >
                      {owner.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </td>

                  <td>
                    <button
                      className="admin-view-button"
                      onClick={() => setSelectedOwner(owner)}
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

      {/* OWNER DETAILS */}

      {selectedOwner && (
        <div
          className="admin-owner-overlay"
          onClick={() => setSelectedOwner(null)}
        >
          <div
            className="admin-owner-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-shop-id">
                  {selectedOwner.shopId}
                </span>

                <h2>{selectedOwner.shopName}</h2>

                <p>Owned by {selectedOwner.ownerName}</p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() => setSelectedOwner(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-owner-details">
              <section>
                <h3>Owner Information</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Name</span>
                    <strong>{selectedOwner.ownerName || '—'}</strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>{selectedOwner.phone || '—'}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{selectedOwner.email || '—'}</strong>
                  </div>

                  <div>
                    <span>Mongo ID</span>
                    <strong>{selectedOwner._id}</strong>
                  </div>
                </div>
              </section>

              <section>
                <h3>Shop Information</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Shop ID</span>
                    <strong>{selectedOwner.shopId}</strong>
                  </div>

                  <div>
                    <span>Shop Name</span>
                    <strong>{selectedOwner.shopName || '—'}</strong>
                  </div>

                  <div className="full-width">
                    <span>Description</span>
                    <strong>{selectedOwner.description || '—'}</strong>
                  </div>

                  <div className="full-width">
                    <span>Address</span>
                    <strong>{selectedOwner.address || '—'}</strong>
                  </div>

                  <div>
                    <span>Shop Status</span>
                    <strong>{selectedOwner.isOpen ? 'Open' : 'Closed'}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>
                      {selectedOwner.delivery ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>

                  <div>
                    <span>Pickup</span>
                    <strong>
                      {selectedOwner.pickup ? 'Enabled' : 'Disabled'}
                    </strong>
                  </div>
                </div>
              </section>

              <section>
                <h3>Products ({selectedOwner.products?.length || 0})</h3>

                {selectedOwner.products?.length > 0 ? (
                  <div className="admin-products-list">
                    {selectedOwner.products.map((product) => (
                      <div
                        className="admin-product-row"
                        key={product.productId}
                      >
                        <div>
                          <strong>{product.name}</strong>

                          <span>
                            {product.category} · {product.unit}
                          </span>
                        </div>

                        <div className="admin-product-right">
                          <strong>₹{product.price}</strong>

                          <span
                            className={
                              product.available
                                ? 'product-available'
                                : 'product-unavailable'
                            }
                          >
                            {product.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-no-products">No products added.</p>
                )}
              </section>

              <section>
                <h3>Payment / Settlement</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Provider</span>
                    <strong>{selectedOwner.payment?.provider || '—'}</strong>
                  </div>

                  <div>
                    <span>Onboarding</span>
                    <strong>
                      {selectedOwner.payment?.onboardingStatus || '—'}
                    </strong>
                  </div>

                  <div>
                    <span>KYC</span>
                    <strong>{selectedOwner.payment?.kycStatus || '—'}</strong>
                  </div>

                  <div>
                    <span>Bank</span>
                    <strong>{selectedOwner.payment?.bankStatus || '—'}</strong>
                  </div>

                  <div>
                    <span>Settlement</span>
                    <strong>
                      {selectedOwner.razorpay?.settlementEnabled
                        ? 'Enabled'
                        : 'Not Enabled'}
                    </strong>
                  </div>
                </div>
              </section>

              <section>
                <h3>Account Dates</h3>

                <div className="admin-detail-grid">
                  <div>
                    <span>Created</span>
                    <strong>
                      {selectedOwner.createdAt
                        ? new Date(selectedOwner.createdAt).toLocaleString()
                        : '—'}
                    </strong>
                  </div>

                  <div>
                    <span>Last Updated</span>
                    <strong>
                      {selectedOwner.updatedAt
                        ? new Date(selectedOwner.updatedAt).toLocaleString()
                        : '—'}
                    </strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOwners;
