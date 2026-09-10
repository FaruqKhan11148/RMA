const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db.js');

const ownerRoutes = require('./routes/ownerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shopRoutes = require('./routes/shopRoutes');
const paymentRoutes = require('./routes/payments');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminOwnerRoutes = require('./routes/adminOwnerRoutes');
const adminCustomerRoutes = require('./routes/adminCustomerRoutes');
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminDeliveryRoutes = require('./routes/adminDeliveryRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   CORS
========================= */

const allowedOrigins = ['http://localhost:3000', 'https://rma-rho.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked CORS origin:', origin);

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },

  credentials: true,

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use((req, res, next) => {
  const isPayUCallback =
    req.path === '/api/payments/payu/success' ||
    req.path === '/api/payments/payu/failure' ||
    req.path === '/api/payments/payu/refund-callback';

  if (isPayUCallback) {
    return next();
  }

  return cors(corsOptions)(req, res, next);
});

/* =========================
   MIDDLEWARE
========================= */

app.use(cookieParser());

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use('/api/owners', ownerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/owners', adminOwnerRoutes);
app.use('/api/admin/customers', adminCustomerRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/delivery', adminDeliveryRoutes);

app.use('/api/customers', customerRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (req, res) => {
  res.json({
    message: 'RMA Backend is running',
  });
});

/* =========================
   DATABASE
========================= */

connectDB();

/* =========================
   SERVER
========================= */

app.listen(PORT, () => {
  console.log(`RMA server running on port ${PORT}`);
});
