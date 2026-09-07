import './App.css';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OwnerProtectedRoute from './pages/Owner/OwnerProtectedRoute/OwnerProtectedRoute';

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

import OwnerSettings from './pages/Owner/OwnerSettings/OwnerSettings';

import OwnerLogin from './pages/Owner/OwnerLogin/OwnerLogin';
import OwnerDashboard from './pages/Owner/OwnerDashboard/OwnerDashboard';
import OwnerOrders from './pages/Owner/OwnerOrders/OwnerOrders';
import ShopCreated from './pages/Owner/ShopCreated/ShopCreated';
import Location from './pages/Owner/OwnerSettings/Shop/Location';
import OpenClosed from './pages/Owner/OwnerSettings/Shop/OpenClosed';

import DeliveryAvailable from './pages/Owner/OwnerSettings/Delivery/DeliveryAvailable';
import PickupAvailable from './pages/Owner/OwnerSettings/Delivery/PickupAvailable';
import DeliverySettings from './pages/Owner/OwnerSettings/Delivery/DeliverySettings';
import DeliveryPerson from './pages/Owner/OwnerSettings/Delivery/DeliveryPerson';

import PaymentDetails from './pages/Owner/OwnerSettings/Payment/PaymentDetails';

import ViewProducts from './pages/Owner/OwnerSettings/Products/ViewProducts';
import AddProduct from './pages/Owner/OwnerSettings/Products/AddProduct';
import ChangePrice from './pages/Owner/OwnerSettings/Products/ChangePrice';
import EditProduct from './pages/Owner/OwnerSettings/Products/EditProduct';

import OwnerStep1 from './pages/Owner/OwnerRegister/OwnerStep1';
import OwnerStep2 from './pages/Owner/OwnerRegister/OwnerStep2';
import OwnerStep3 from './pages/Owner/OwnerRegister/OwnerStep3';
import OwnerStep4 from './pages/Owner/OwnerRegister/OwnerStep4';

/* Owner Settings */
import OwnerName from './pages/Owner/OwnerSettings/Account/OwnerName';
import PhoneNumber from './pages/Owner/OwnerSettings/Account/PhoneNumber';
import Email from './pages/Owner/OwnerSettings/Account/Email';
import Password from './pages/Owner/OwnerSettings/Account/Password';

import ShopName from './pages/Owner/OwnerSettings/Shop/ShopName';
import Description from './pages/Owner/OwnerSettings/Shop/Description';
import Address from './pages/Owner/OwnerSettings/Shop/Address';

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
import PersonalDetails from './pages/Profile/PersonalDetails/PersonalDetails';
import SavedAddresses from './pages/Profile/SavedAddresses/SavedAddresses';
import AddAddress from './pages/Profile/SavedAddresses/AddAddress';
import EditAddress from './pages/Profile/SavedAddresses/EditAddress';
import Language from './pages/Profile/Language/Language';
import HelpSupport from './pages/Profile/HelpSupport/HelpSupport';
import ReportIssue from './pages/Profile/HelpSupport/ReportIssue';
import Contact from './pages/Contact/Contact';
import Privacy from './pages/Privacy/Privacy';
import Terms from './pages/Terms/Terms';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="app_content">
        <Routes>
          {/* ==================== CUSTOMER ROUTES ==================== */}

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

          {/* ==================== OWNER PUBLIC ROUTES ==================== */}

          <Route path="/owner/register/step-1" element={<OwnerStep1 />} />

          <Route path="/owner/register/step-2" element={<OwnerStep2 />} />

          <Route path="/owner/register/step-3" element={<OwnerStep3 />} />

          <Route path="/owner/register/step-4" element={<OwnerStep4 />} />

          <Route path="/owner/shop-created" element={<ShopCreated />} />

          <Route path="/owner/login" element={<OwnerLogin />} />

          {/* ==================== OWNER PROTECTED ROUTES ==================== */}

          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />

            <Route path="/owner/orders" element={<OwnerOrders />} />

            {/* ---------- ACCOUNT SETTINGS ---------- */}

            <Route path="/owner/settings/account" element={<OwnerSettings />} />

            <Route
              path="/owner/settings/account/name"
              element={<OwnerName />}
            />

            <Route
              path="/owner/settings/account/phone"
              element={<PhoneNumber />}
            />

            <Route path="/owner/settings/account/email" element={<Email />} />

            <Route
              path="/owner/settings/account/password"
              element={<Password />}
            />

            {/* ---------- SHOP SETTINGS ---------- */}

            <Route path="/owner/settings/shop/name" element={<ShopName />} />

            <Route
              path="/owner/settings/shop/description"
              element={<Description />}
            />

            <Route path="/owner/settings/shop/address" element={<Address />} />

            <Route
              path="/owner/settings/shop/location"
              element={<Location />}
            />

            <Route
              path="/owner/settings/shop/open-closed"
              element={<OpenClosed />}
            />

            {/* ---------- DELIVERY SETTINGS ---------- */}

            <Route
              path="/owner/settings/delivery/available"
              element={<DeliveryAvailable />}
            />

            <Route
              path="/owner/settings/delivery/pickup"
              element={<PickupAvailable />}
            />

            <Route
              path="/owner/settings/delivery/settings"
              element={<DeliverySettings />}
            />

            <Route
              path="/owner/settings/delivery/person"
              element={<DeliveryPerson />}
            />

            {/* ---------- PRODUCT SETTINGS ---------- */}

            <Route path="/owner/settings/products" element={<ViewProducts />} />

            <Route
              path="/owner/settings/products/add"
              element={<AddProduct />}
            />

            <Route
              path="/owner/settings/products/change-price/:productId"
              element={<ChangePrice />}
            />

            <Route
              path="/owner/settings/products/edit/:productId"
              element={<EditProduct />}
            />

            {/* ---------- PAYMENT SETTINGS ---------- */}

            <Route
              path="/owner/settings/payment"
              element={<PaymentDetails />}
            />
          </Route>

          {/* ==================== DELIVERY ROUTES ==================== */}

          <Route path="/delivery/orders" element={<DeliveryOrders />} />

          {/* ==================== PAYMENT ==================== */}

          <Route path="/payment/:orderId" element={<Payment />} />

          {/* ==================== QR ==================== */}

          <Route path="/scan-qr" element={<ScanQR />} />

          {/* ==================== ADMIN ==================== */}

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/owners" element={<AdminOwners />} />

          <Route path="/admin/customers" element={<AdminCustomers />} />

          <Route path="/admin/delivery" element={<AdminDelivery />} />

          <Route path="/admin/orders" element={<AdminOrders />} />

          <Route path="/admin/payments" element={<AdminPayments />} />

          <Route path="/admin/finance" element={<AdminFinance />} />

          {/* ==================== CUSTOMER AUTH ==================== */}

          <Route path="/customer/login" element={<CustomerLogin />} />

          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route
            path="/profile/personal-details"
            element={<PersonalDetails />}
          />
          <Route path="/profile/saved-addresses" element={<SavedAddresses />} />
          <Route path="/profile/saved-addresses/add" element={<AddAddress />} />
          <Route
            path="/profile/saved-addresses/edit/:addressId"
            element={<EditAddress />}
          />
          <Route path="/profile/language" element={<Language />} />
          <Route path="/profile/help-support" element={<HelpSupport />} />
          <Route
            path="/profile/help-support/report"
            element={<ReportIssue />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </div>

      <SiteFooter />

      <Footer />
    </BrowserRouter>
  );
}

export default App;
