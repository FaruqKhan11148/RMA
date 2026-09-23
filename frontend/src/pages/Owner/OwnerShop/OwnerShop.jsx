import './OwnerShop.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Truck,
  XCircle,
} from 'lucide-react';

function OwnerShop() {
  const navigate = useNavigate();

  const [shopOwner, setShopOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('rma_owner_token');

    if (!token) {
      navigate('/owner/login');
      return;
    }

    const fetchOwner = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shop');
        }

        setShopOwner(data.owner);
        localStorage.setItem('rma_owner', JSON.stringify(data.owner));
      } catch (error) {
        console.error('Fetch owner shop failed:', error);

        setError(error.message || 'Unable to load shop');
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [navigate]);

  const availableProducts = useMemo(() => {
    return shopOwner?.products?.filter((product) => product.available) || [];
  }, [shopOwner]);

  const categories = useMemo(() => {
    if (shopOwner?.categories?.length) {
      return shopOwner.categories;
    }

    return [
      ...new Set(
        (shopOwner?.products || [])
          .map((product) => product.category)
          .filter(Boolean),
      ),
    ];
  }, [shopOwner]);

  const previewProducts = useMemo(() => {
    return availableProducts.slice(0, 4);
  }, [availableProducts]);

  const copyShopId = async () => {
    if (!shopOwner?.shopId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shopOwner.shopId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error('Copy shop ID failed:', error);
    }
  };

  const viewCustomerShop = () => {
    if (!shopOwner?.shopId) {
      return;
    }

    navigate(`/shop/${shopOwner.shopId}`);
  };

  if (loading) {
    return (
      <main className="owner_shop_page">
        <div className="owner_shop_loading">
          <div className="owner_shop_spinner" />
          <p>Loading your shop...</p>
        </div>
      </main>
    );
  }

  if (error || !shopOwner) {
    return (
      <main className="owner_shop_page">
        <div className="owner_shop_error">
          <XCircle size={30} />

          <h2>Unable to load shop</h2>

          <p>{error || 'Shop information is unavailable.'}</p>

          <button type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="owner_shop_page">
      {/* SHOP HEADER */}

      <section className="owner_shop_header">
        <div className="owner_shop_header_content">
          <div className="owner_shop_status">
            {shopOwner.isOpen ? (
              <>
                <span className="owner_shop_status_dot open" />
                Open
              </>
            ) : (
              <>
                <span className="owner_shop_status_dot closed" />
                Closed
              </>
            )}
          </div>

          <h1>{shopOwner.shopName}</h1>

          <div className="owner_shop_id_row">
            <span>Shop ID: {shopOwner.shopId}</span>

            <button
              type="button"
              className="owner_shop_copy_button"
              onClick={copyShopId}
              aria-label="Copy shop ID"
            >
              <Copy size={15} />
            </button>

            {copied && <small>Copied</small>}
          </div>

          {shopOwner.description && (
            <p className="owner_shop_description">{shopOwner.description}</p>
          )}
        </div>
      </section>

      {/* SHOP OVERVIEW */}

      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div>
            <h2>Shop Overview</h2>
            <span>Your current shop information</span>
          </div>
        </div>

        <div className="owner_shop_overview_grid">
          <div className="owner_shop_overview_card">
            <div className="owner_shop_overview_icon">
              <Package size={19} />
            </div>

            <div>
              <span>Products</span>
              <strong>{shopOwner.products?.length || 0}</strong>
            </div>
          </div>

          <div className="owner_shop_overview_card">
            <div className="owner_shop_overview_icon available">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <span>Available</span>
              <strong>{availableProducts.length}</strong>
            </div>
          </div>

          <div className="owner_shop_overview_card">
            <div className="owner_shop_overview_icon">
              <ShoppingBag size={19} />
            </div>

            <div>
              <span>Categories</span>
              <strong>{categories.length}</strong>
            </div>
          </div>

          <div className="owner_shop_overview_card">
            <div className="owner_shop_overview_icon rating">
              <Star size={19} />
            </div>

            <div>
              <span>Rating</span>
              <strong>
                {shopOwner.rating?.average
                  ? Number(shopOwner.rating.average).toFixed(1)
                  : '—'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER SHOP */}

      <section className="owner_shop_customer_card">
        <div className="owner_shop_customer_icon">
          <ShoppingBag size={22} />
        </div>

        <div className="owner_shop_customer_content">
          <strong>Customer Shop</strong>

          <span>See how customers can find and view your shop.</span>
        </div>

        <button
          type="button"
          className="owner_shop_customer_button"
          onClick={viewCustomerShop}
        >
          View
        </button>
      </section>

      {/* SERVICES */}

      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div>
            <h2>Services</h2>
            <span>What your shop currently offers</span>
          </div>
        </div>

        <div className="owner_shop_services">
          <div
            className={`owner_shop_service ${
              shopOwner.delivery ? 'enabled' : 'disabled'
            }`}
          >
            <div className="owner_shop_service_icon">
              <Truck size={20} />
            </div>

            <div>
              <strong>Delivery</strong>

              <span>
                {shopOwner.delivery
                  ? 'Available to customers'
                  : 'Currently unavailable'}
              </span>
            </div>

            <span className="owner_shop_service_status">
              {shopOwner.delivery ? 'Available' : 'Off'}
            </span>
          </div>

          <div
            className={`owner_shop_service ${
              shopOwner.pickup ? 'enabled' : 'disabled'
            }`}
          >
            <div className="owner_shop_service_icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <strong>Pickup</strong>

              <span>
                {shopOwner.pickup
                  ? 'Available to customers'
                  : 'Currently unavailable'}
              </span>
            </div>

            <span className="owner_shop_service_status">
              {shopOwner.pickup ? 'Available' : 'Off'}
            </span>
          </div>
        </div>
      </section>

      {/* ADDRESS */}

      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div>
            <h2>Shop Location</h2>
            <span>Your registered shop address</span>
          </div>
        </div>

        <div className="owner_shop_address_card">
          <div className="owner_shop_address_icon">
            <MapPin size={20} />
          </div>

          <div>
            <strong>{shopOwner.shopName}</strong>

            <p>{shopOwner.address}</p>

            {shopOwner.location?.latitude && shopOwner.location?.longitude && (
              <span>Location coordinates available</span>
            )}
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}

      <section className="owner_shop_section">
        <div className="owner_shop_section_header">
          <div>
            <h2>Products</h2>

            <span>
              {availableProducts.length === 0
                ? 'No available products'
                : `${availableProducts.length} available product${
                    availableProducts.length > 1 ? 's' : ''
                  }`}
            </span>
          </div>

          <button
            type="button"
            className="owner_shop_section_action"
            onClick={() => navigate('/owner/settings/products')}
          >
            Manage
          </button>
        </div>

        {previewProducts.length === 0 ? (
          <div className="owner_shop_empty">
            <Package size={28} />

            <strong>No available products</strong>

            <p>Add products from your product settings.</p>
          </div>
        ) : (
          <div className="owner_shop_products">
            {previewProducts.map((product) => (
              <div className="owner_shop_product_card" key={product.productId}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="owner_shop_product_placeholder">
                    <Package size={22} />
                  </div>
                )}

                <div className="owner_shop_product_content">
                  <strong>{product.name}</strong>

                  <span>
                    {product.category} · {product.unit}
                  </span>

                  <b>₹{product.price}</b>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OwnerShop;
