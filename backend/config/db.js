const dns = require('dns');
const mongoose = require('mongoose');

if (process.env.USE_GOOGLE_DNS === 'true') {
  dns.setServers(['8.8.8.8']);
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
