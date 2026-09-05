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

app.use(
  cors({
    origin: 'https://rma-rho.vercel.app/',
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

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

app.get('/', (req, res) => {
  res.json({ message: 'RMA Backend is running' });
});

connectDB();

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
