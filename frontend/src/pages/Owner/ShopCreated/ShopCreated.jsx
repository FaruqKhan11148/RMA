import './ShopCreated.css';

import { useLocation, useNavigate } from 'react-router-dom';
import ShopQRCode from '../../../components/ShopQRCode/ShopQRCode';

import ShopCreatedSuccess from './components/ShopCreatedSuccess';
import ShopCreatedInfo from './components/ShopCreatedInfo';
import ShopCreatedNumber from './components/ShopCreatedNumber';
import ShopCreatedActions from './components/ShopCreatedActions';

function ShopCreated() {
  const location = useLocation();
  const navigate = useNavigate();

  const owner = location.state?.owner;

  // If someone opens this page directly without registering
  if (!owner) {
    return (
      <main className="shop_created">
        <section className="shop_created_card">
          <h1>Shop information not found</h1>

          <p>Please register your shop first.</p>

          <button
            className="shop_created_button"
            onClick={() => navigate('/owner/register/step-1')}
          >
            Register Shop
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shop_created">
      <section className="shop_created_card">
        <ShopCreatedSuccess />

        <ShopCreatedInfo owner={owner} />

        <ShopCreatedNumber shopId={owner.shopId} />

        {/* QR CODE */}

        <ShopQRCode shopId={owner.shopId} />

        <ShopCreatedActions navigate={navigate} />
      </section>
    </main>
  );
}

export default ShopCreated;
