import './App.css';
import './index.css';

import { useEffect, useState } from 'react';

import {
  requestCustomerNotificationPermission,
  listenForCustomerNotifications,
} from './firebase/notifications';

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  // useNavigate,
} from 'react-router-dom';

// import FlashMessage from './components/FlashMessage/FlashMessage';

import About from './pages/About/About';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions/TermsConditions';

import OwnerProtectedRoute from './pages/Owner/OwnerProtectedRoute/OwnerProtectedRoute';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import DeliveryPartnerRegister from './pages/DeliveryPartner/DeliveryPartnerRegister/DeliveryPartnerRegister';
import DeliveryApplication from './pages/DeliveryPartner/Application/DeliveryApplication';
import ApplicationProfile from './pages/DeliveryPartner/Application/Profile/ApplicationProfile';
import ApplicationAddress from './pages/DeliveryPartner/Application/Address/ApplicationAddress';
import ApplicationKyc from './pages/DeliveryPartner/Application/Kyc/ApplicationKyc';
import ApplicationDrivingLicence from './pages/DeliveryPartner/Application/DrivingLicence/ApplicationDrivingLicence';
import ApplicationVehicle from './pages/DeliveryPartner/Application/Vehicle/ApplicationVehicle';
import ApplicationBank from './pages/DeliveryPartner/Application/Bank/ApplicationBank';
import RmaApplicationProtectedRoute from './pages/DeliveryPartner/Application/RmaApplicationProtectedRoute';

import RMADeliveryLogin from './pages/delivery/RMADeliveryLogin/RMADeliveryLogin';
import DeliveryDashboard from './pages/DeliveryPartner/Dashboard/DeliveryDashboard';
import DeliveryOrdersDelivery from './pages/DeliveryPartner/Orders/DeliveryOrders';
import DeliveryEarnings from './pages/DeliveryPartner/Earnings/DeliveryEarnings';
import Wallet from './pages/DeliveryPartner/Earnings/Wallet/Wallet';
import Withdraw from './pages/DeliveryPartner/Earnings/Withdraw/Withdraw';
import WithdrawalHistory from './pages/DeliveryPartner/Earnings/WithdrawalHistory/WithdrawalHistory';
import EarningsHistory from './pages/DeliveryPartner/Earnings/EarningsHistory/EarningsHistory';
import DeliveryProfile from './pages/DeliveryPartner/Profile/DeliveryProfile';
import DeliveryHistory from './pages/DeliveryPartner/History/DeliveryHistory';

import Navbar from './components/Navbar/Navbar';
import SiteFooter from './components/SiteFooter/SiteFooter';
import Footer from './components/Footer/Footer';
import OwnerFooter from './components/OwnerFooter/OwnerFooter';

import Home from './pages/Home/Home';
import FindShop from './pages/FindShop/FindShop';
import Shop from './pages/Shop/Shop';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import DeliveryStatus from './pages/DeliveryStatus/DeliveryStatus';
import Orders from './pages/Orders/Orders';
import RateOrder from './pages/RateOrder/RateOrder';
import Profile from './pages/Profile/Profile';
import Payment from './pages/payment/Payment';
import Notifications from './pages/Notifications/Notifications';
import NotFound from './pages/NotFound/NotFound';
import RMAChat from './pages/RMAChat/RMAChat';
import Appearance from './pages/Profile/Appearance/Appearance';

import OwnerSettings from './pages/Owner/OwnerSettings/OwnerSettings';

import OwnerLogin from './pages/Owner/OwnerLogin/OwnerLogin';
import OwnerDashboard from './pages/Owner/OwnerDashboard/OwnerDashboard';
import OwnerOrders from './pages/Owner/OwnerOrders/OwnerOrders';
import Offers from './pages/Owner/Offers/Offers';
import ShopCreated from './pages/Owner/ShopCreated/ShopCreated';
import Location from './pages/Owner/OwnerSettings/Shop/Location';
import OpenClosed from './pages/Owner/OwnerSettings/Shop/OpenClosed';

import DeliveryAvailable from './pages/Owner/OwnerSettings/Delivery/DeliveryAvailable';
import PickupAvailable from './pages/Owner/OwnerSettings/Delivery/PickupAvailable';
import DeliverySettings from './pages/Owner/OwnerSettings/Delivery/DeliverySettings';
import DeliveryPerson from './pages/Owner/OwnerSettings/Delivery/DeliveryPerson';
import DeliveryFooter from './pages/DeliveryPartner/DeliveryFooter/DeliveryFooter';

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

// import DeliveryOrders from './pages/delivery/DeliveryOrders/DeliveryOrders';
import ScanQR from './pages/ScanQR/ScanQR';

import OwnerEarnings from './pages/Owner/OwnerEarnings/OwnerEarnings';
import OwnerShop from './pages/Owner/OwnerShop/OwnerShop';

// ADMIN
import AdminLogin from './pages/Admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminOwners from './pages/Admin/AdminOwners/AdminOwners';
import AdminCustomers from './pages/Admin/AdminCustomers/AdminCustomers';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';
import AdminDelivery from './pages/Admin/AdminDelivery/AdminDelivery';
import AdminPayments from './pages/Admin/AdminPayments/AdminPayments';
import AdminFinance from './pages/Admin/AdminFinance/AdminFinance';

import AdminShops from './pages/Admin/Shops/AdminShops';
import AdminShopDetails from './pages/Admin/Shops/AdminShopDetails';
import AdminOrderDetails from './pages/Admin/AdminOrders/AdminOrderDetails';
import AdminDailyOrders from './pages/Admin/AdminOrders/AdminDailyOrders';
import AdminMonthlyFinance from './pages/Admin/AdminFinance/AdminMonthlyFinance';
import AdminDeliveryWithdrawals from './pages/Admin/AdminDeliveryWithdrawals/AdminDeliveryWithdrawals';
import AdminDeliveryEarnings from './pages/Admin/AdminDeliveryEarnings/AdminDeliveryEarnings';

import DeliveryPartners from './pages/Admin/DeliveryPartners/DeliveryPartners';

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
import ShopPromotion from './pages/Owner/OwnerSettings/ShopPromotion/ShopPromotion';

function AppLayout() {
  const location = useLocation();
  const isRMAChatRoute = location.pathname === '/rma-chat';
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false);
  const [profileRole, setProfileRole] = useState(null);
  // const navigate = useNavigate();

  // const [flashMessage, setFlashMessage] = useState('');

  // const maintenanceRoutes = ['/owner', '/delivery', '/admin'];

  // const isMaintenanceRoute = maintenanceRoutes.some((route) =>
  //   location.pathname.startsWith(route),
  // );

  // useEffect(() => {
  //   if (!isMaintenanceRoute) {
  //     return;
  //   }

  //   setFlashMessage(
  //     'This section is currently under maintenance. Please check back soon.',
  //   );

  //   navigate('/', { replace: true });
  // }, [isMaintenanceRoute, navigate]);

  useEffect(() => {
    const checkCustomerLogin = async () => {
      try {
        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/customers/me',
          {
            credentials: 'include',
          },
        );

        if (response.ok) {
          setCustomerLoggedIn(true);
        } else {
          setCustomerLoggedIn(false);
        }
      } catch (error) {
        console.error('Customer login check failed:', error);

        setCustomerLoggedIn(false);
      }
    };

    checkCustomerLogin();
  }, []);

  useEffect(() => {
    if (!customerLoggedIn) {
      return;
    }

    let unsubscribe;
    let isActive = true;

    const setupNotifications = async () => {
      await requestCustomerNotificationPermission();

      if (!isActive) {
        return;
      }

      const cleanup = await listenForCustomerNotifications((payload) => {
        if (!isActive) {
          return;
        }

        const title =
          payload.notification?.title ||
          payload.data?.title ||
          'RMA Notification';

        const message =
          payload.notification?.body ||
          payload.data?.body ||
          'You have a new notification.';

        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/rma-notification-icon.png',
          });
        }

        window.dispatchEvent(
          new CustomEvent('rma-notification', {
            detail: payload,
          }),
        );
      });

      if (!isActive) {
        if (cleanup) {
          cleanup();
        }

        return;
      }

      unsubscribe = cleanup;
    };

    setupNotifications();

    return () => {
      isActive = false;

      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [customerLoggedIn]);

  const isOwnerRoute =
    location.pathname === '/owner/dashboard' ||
    location.pathname === '/owner/orders' ||
    location.pathname === '/owner/earnings' ||
    location.pathname === '/owner/offers' ||
    location.pathname === '/owner/shop' ||
    location.pathname.startsWith('/owner/settings/');

  const isDeliveryRoute =
    location.pathname.startsWith('/delivery/') ||
    location.pathname.startsWith('/delivery-partner/');

  const isAdminRoute = location.pathname.startsWith('/admin/');

  const hasDeliverySession =
    Boolean(localStorage.getItem('delivery_token')) &&
    Boolean(localStorage.getItem('delivery_person'));

  const showOwnerFooter =
    !isAdminRoute &&
    !isDeliveryRoute &&
    !hasDeliverySession &&
    (isOwnerRoute || profileRole === 'owner');

  const showDeliveryFooter =
    !isAdminRoute &&
    (isDeliveryRoute ||
      (hasDeliverySession &&
        (location.pathname === '/profile' ||
          location.pathname === '/notifications')));

  const showCustomerFooter =
    !isAdminRoute &&
    !isDeliveryRoute &&
    !hasDeliverySession &&
    !isOwnerRoute &&
    profileRole !== 'owner' &&
    profileRole !== 'delivery';
  return (
    <>
      <ScrollToTop />
      {/* <FlashMessage
        message={flashMessage}
        onClose={() => setFlashMessage('')}
      /> */}

      {!isRMAChatRoute && <Navbar />}

      <div
        className={
          isRMAChatRoute ? 'app_content app_content_chat' : 'app_content'
        }
      >
        <Routes>
          {/* About Us */}

          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />

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

          <Route path="/rate-order/:orderId" element={<RateOrder />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/profile"
            element={<Profile onRoleChange={setProfileRole} />}
          />

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
            <Route path="/owner/earnings" element={<OwnerEarnings />} />
            <Route path="/owner/offers" element={<Offers />} />
            <Route path="/owner/shop" element={<OwnerShop />} />

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

          {/* ==================== RMA DELIVERY APPLICATION ==================== */}

          <Route
            path="/delivery-partner/register"
            element={<DeliveryPartnerRegister />}
          />

          <Route path="/delivery/rma-login" element={<RMADeliveryLogin />} />

          <Route element={<RmaApplicationProtectedRoute />}>
            <Route
              path="/delivery-partner/application"
              element={<DeliveryApplication />}
            />

            <Route
              path="/delivery/rma/application"
              element={<DeliveryApplication />}
            />

            <Route
              path="/delivery-partner/application/profile"
              element={<ApplicationProfile />}
            />

            <Route
              path="/delivery-partner/application/address"
              element={<ApplicationAddress />}
            />

            <Route
              path="/delivery-partner/application/kyc"
              element={<ApplicationKyc />}
            />

            <Route
              path="/delivery-partner/application/driving-licence"
              element={<ApplicationDrivingLicence />}
            />

            <Route
              path="/delivery-partner/application/vehicle"
              element={<ApplicationVehicle />}
            />

            <Route
              path="/delivery-partner/application/bank"
              element={<ApplicationBank />}
            />
          </Route>

          <Route
            path="/delivery-partner/login"
            element={<DeliveryOrdersDelivery />}
          />

          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          <Route
            path="/delivery/orders-delivery"
            element={<DeliveryOrdersDelivery />}
          />

          <Route path="/delivery/earnings" element={<DeliveryEarnings />} />
          <Route path="/delivery/earnings/wallet" element={<Wallet />} />

          <Route path="/delivery/earnings/withdraw" element={<Withdraw />} />
          <Route
            path="/delivery/earnings/withdrawals"
            element={<WithdrawalHistory />}
          />

          <Route
            path="/delivery/earnings/history"
            element={<EarningsHistory />}
          />

          <Route path="/delivery/profile" element={<DeliveryProfile />} />

          <Route path="/delivery/history" element={<DeliveryHistory />} />
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

          <Route
            path="/admin/delivery-withdrawals"
            element={<AdminDeliveryWithdrawals />}
          />

          <Route
            path="/admin/delivery-earnings"
            element={<AdminDeliveryEarnings />}
          />

          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/shops/:shopId" element={<AdminShopDetails />} />
          <Route
            path="/admin/orders/:orderId"
            element={<AdminOrderDetails />}
          />
          <Route path="/admin/orders/daily" element={<AdminDailyOrders />} />
          <Route
            path="/admin/finance/monthly"
            element={<AdminMonthlyFinance />}
          />
          <Route
            path="/admin/delivery-partners"
            element={<DeliveryPartners />}
          />

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
          <Route path="/rma-chat" element={<RMAChat />} />

          <Route path="/profile/appearance" element={<Appearance />} />
          <Route
            path="/owner/settings/shop-promotion"
            element={<ShopPromotion />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {!isRMAChatRoute && <SiteFooter />}

      {!isRMAChatRoute && showOwnerFooter && <OwnerFooter />}

      {!isRMAChatRoute && showDeliveryFooter && <DeliveryFooter />}

      {!isRMAChatRoute && showCustomerFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
