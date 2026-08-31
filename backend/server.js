const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db.js');

const ownerRoutes = require('./routes/ownerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shopRoutes = require('./routes/shopRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/owners', ownerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shops', shopRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RMA Backend is running' });
});

connectDB();

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
