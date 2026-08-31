import './FindShop.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FindShop() {
  const [shopId, setShopId] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!shopId.trim()) {
      return;
    }

    navigate(`/shop/${shopId.trim()}`);
  };

  return (
    <main className="find_shop">
      <section className="find_shop_content">
        <h1>Find Your Shop</h1>

        <p>Enter the unique RMA Shop ID provided by your local meat shop.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="shopId">Shop ID</label>

          <input
            id="shopId"
            type="text"
            placeholder="Example: RMA-000001"
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
          />

          <button type="submit">Continue</button>
        </form>
      </section>
    </main>
  );
}

export default FindShop;
