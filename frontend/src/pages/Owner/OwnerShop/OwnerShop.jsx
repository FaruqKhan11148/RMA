import './OwnerShop.css';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

import OwnerShopHeader from './components/OwnerShopHeader';
import OwnerShopOverview from './components/OwnerShopOverview';
import OwnerShopCustomer from './components/OwnerShopCustomer';
import OwnerShopServices from './components/OwnerShopServices';
import OwnerShopAddress from './components/OwnerShopAddress';
import OwnerShopProducts from './components/OwnerShopProducts';

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
      <OwnerShopHeader
        shopOwner={shopOwner}
        copied={copied}
        copyShopId={copyShopId}
      />

      <OwnerShopOverview
        shopOwner={shopOwner}
        availableProducts={availableProducts}
        categories={categories}
      />

      <OwnerShopCustomer viewCustomerShop={viewCustomerShop} />

      <OwnerShopServices shopOwner={shopOwner} />

      <OwnerShopAddress shopOwner={shopOwner} />

      <OwnerShopProducts
        availableProducts={availableProducts}
        previewProducts={previewProducts}
        navigate={navigate}
      />
    </main>
  );
}

export default OwnerShop;
