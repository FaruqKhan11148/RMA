import './App.css';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import FindShop from './pages/FindShop/FindShop';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import DeliveryStatus from './pages/DeliveryStatus/DeliveryStatus';
import Orders from './pages/Orders/Orders';
import Profile from './pages/Profile/Profile';
import Payment from './pages/payment/Payment';

import OwnerLogin from './pages/Owner/OwnerLogin/OwnerLogin';
import OwnerRegister from './pages/Owner/OwnerRegister/OwnerRegister';
import OwnerDashboard from './pages/Owner/OwnerDashboard/OwnerDashboard';
import OwnerOrders from './pages/Owner/OwnerOrders/OwnerOrders';
import ShopCreated from './pages/Owner/ShopCreated/ShopCreated';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="app_content">
        <Routes>
          {/* CUSTOMER ROUTES */}

          <Route path="/" element={<Home />} />

          <Route path="/find-shop" element={<FindShop />} />

          <Route path="/shop/:shopId" element={<Shop />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/delivery-status/:orderId"
            element={<DeliveryStatus />}
          />

          <Route path="/orders" element={<Orders />} />

          <Route path="/profile" element={<Profile />} />

          {/* OWNER ROUTES */}

          <Route path="/owner/register" element={<OwnerRegister />} />

          <Route path="/owner/shop-created" element={<ShopCreated />} />

          <Route path="/owner/login" element={<OwnerLogin />} />

          <Route path="/owner/dashboard" element={<OwnerDashboard />} />

          <Route path="/owner/orders" element={<OwnerOrders />} />

          <Route path="/payment/:orderId" element={<Payment />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
