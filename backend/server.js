const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const {
  startOwnerOfferScheduler,
} = require('./services/ownerOffers/ownerOffer.scheduler');

const connectDB = require('./config/db.js');

const ownerRoutes = require('./routes/owner');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const shopRoutes = require('./routes/shops');
const paymentRoutes = require('./routes/payments/index');
const deliveryRoutes = require('./routes/delivery');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const testBankAccountRoutes = require('./routes/test-bank/account.routes');
const testBankLedgerRoutes = require('./routes/test-bank/ledger.routes');
const testBankSettlementRoutes = require('./routes/test-bank/settlement.routes');

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   CORS
========================= */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'https://rma-rho.vercel.app',
];

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
  const isPaymentProviderCallback =
    req.path === '/api/payments/payu/success' ||
    req.path === '/api/payments/payu/failure' ||
    req.path === '/api/payments/payu/refund-callback' ||
    req.path === '/api/payments/cashfree/webhook';

  if (isPaymentProviderCallback) {
    return next();
  }

  if (isPayUCallback) {
    return next();
  }

  return cors(corsOptions)(req, res, next);
});

/* =========================
   MIDDLEWARE
========================= */

app.use(cookieParser());

app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.split('?')[0] === '/api/payments/cashfree/webhook') {
        req.rawBody = buf.toString('utf8');
      }
    },
  }),
);

/* =========================
   ROUTES
========================= */

app.use('/api/owners', ownerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/api/test-bank/accounts', testBankAccountRoutes);
app.use('/api/test-bank/ledger', testBankLedgerRoutes);
app.use('/api/test-bank/settlements', testBankSettlementRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (req, res) => {
  res.json({
    message: 'RMA Backend is running',
  });
});

/* =========================
   DATABASE + SERVER
========================= */

async function startServer() {
  try {
    await connectDB();

    startOwnerOfferScheduler();

    app.listen(PORT, () => {
      console.log(`RMA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start RMA server:', error.message);
    process.exit(1);
  }
}

startServer();
