import './App.css';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import SiteFooter from './components/SiteFooter/SiteFooter';
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
import OwnerDashboard from './pages/Owner/OwnerDashboard/OwnerDashboard';
import OwnerOrders from './pages/Owner/OwnerOrders/OwnerOrders';
import ShopCreated from './pages/Owner/ShopCreated/ShopCreated';

import OwnerStep1 from './pages/Owner/OwnerRegister/OwnerStep1';
import OwnerStep2 from './pages/Owner/OwnerRegister/OwnerStep2';
import OwnerStep3 from './pages/Owner/OwnerRegister/OwnerStep3';
import OwnerStep4 from './pages/Owner/OwnerRegister/OwnerStep4';

import DeliveryOrders from './pages/delivery/DeliveryOrders/DeliveryOrders';
import ScanQR from './pages/ScanQR/ScanQR';

// ADMIN
import AdminLogin from './pages/Admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminOwners from './pages/Admin/AdminOwners/AdminOwners';
import AdminCustomers from './pages/Admin/AdminCustomers/AdminCustomers';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';
import AdminDelivery from './pages/Admin/AdminDelivery/AdminDelivery';
import AdminPayments from './pages/Admin/AdminPayments/AdminPayments';
import AdminFinance from './pages/Admin/AdminFinance/AdminFinance';

// Customer
import CustomerLogin from './pages/Customer/CustomerLogin/CustomerLogin';
import CustomerSignup from './pages/Customer/CustomerSignup/CustomerSignup';

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

          <Route path="/owner/register/step-1" element={<OwnerStep1 />} />

          <Route path="/owner/register/step-2" element={<OwnerStep2 />} />

          <Route path="/owner/register/step-3" element={<OwnerStep3 />} />

          <Route path="/owner/register/step-4" element={<OwnerStep4 />} />

          <Route path="/owner/shop-created" element={<ShopCreated />} />

          <Route path="/owner/login" element={<OwnerLogin />} />

          <Route path="/owner/dashboard" element={<OwnerDashboard />} />

          <Route path="/owner/orders" element={<OwnerOrders />} />

          {/* DELIVERY ROUTES */}

          <Route path="/delivery/orders" element={<DeliveryOrders />} />

          {/* PAYMENT */}

          <Route path="/payment/:orderId" element={<Payment />} />

          <Route path="/scan-qr" element={<ScanQR />} />

          {/* ADMIN */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/owners" element={<AdminOwners />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/delivery" element={<AdminDelivery />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/delivery" element={<AdminDelivery />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/finance" element={<AdminFinance />} />

          {/* Customer */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
        </Routes>
      </div>

      <SiteFooter />

      <Footer />
    </BrowserRouter>
  );
}

export default App;
