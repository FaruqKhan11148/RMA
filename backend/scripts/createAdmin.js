const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

require('dotenv').config();

if (process.env.USE_GOOGLE_DNS === 'true') {
  dns.setServers(['8.8.8.8']);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      console.log('Admin already exists.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      console.error('ADMIN_USERNAME or ADMIN_PASSWORD is missing from .env');

      await mongoose.disconnect();
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      username: username.trim(),
      passwordHash,
      isActive: true,
    });

    console.log('Admin created successfully');
    console.log('Admin ID:', admin._id);
    console.log('Username:', admin.username);

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);

    await mongoose.disconnect().catch(() => {});

    process.exit(1);
  }
};

createAdmin();
