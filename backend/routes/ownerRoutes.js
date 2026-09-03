const express = require('express');
const bcrypt = require('bcryptjs');

const Owner = require('../models/Owner');
const Counter = require('../models/Counter');

const router = express.Router();

// GET ALL OWNERS
router.get('/', async (req, res) => {
  try {
    const owners = await Owner.find().select('-password');

    res.status(200).json({
      owners,
    });
  } catch (error) {
    console.error('Get owners failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// GET SHOP BY SHOP ID
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select('-password');

    if (!owner) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    res.status(200).json({
      shop: owner,
    });
  } catch (error) {
    console.error('Get shop failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// REGISTER OWNER
router.post('/register', async (req, res) => {
  try {
    const {
      ownerName,
      shopName,
      description,
      address,
      phone,
      email,
      password,
      delivery,
      pickup,
      products,
    } = req.body;

    // Check required fields
    if (!ownerName || !shopName || !email || !address || !phone || !password) {
      return res.status(400).json({
        message: 'Required fields are missing',
      });
    }

    // Check whether phone number already exists
    const existingOwner = await Owner.findOne({ phone });

    if (existingOwner) {
      return res.status(409).json({
        message: 'Owner with this phone number already exists',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await Owner.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        message: 'Owner with this email already exists',
      });
    }

    // Check products
    if (!products || products.length === 0) {
      return res.status(400).json({
        message: 'Please add at least one product',
      });
    }

    // Check order options
    if (!delivery && !pickup) {
      return res.status(400).json({
        message: 'Please select at least one order type',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate next Shop ID
    const counter = await Counter.findOneAndUpdate(
      { name: 'shopId' },
      { $inc: { sequenceValue: 1 } },
      {
        returnDocument: 'after',
        upsert: true,
      },
    );

    const shopId = `RMA-${String(counter.sequenceValue).padStart(6, '0')}`;

    // Create owner
    const owner = await Owner.create({
      shopId,
      ownerName,
      shopName,
      description: description || '',
      address,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
      delivery,
      pickup,
      products,
    });

    // Send safe owner data to frontend
    res.status(201).json({
      message: 'Owner registered successfully',

      owner: {
        id: owner._id,
        shopId: owner.shopId,
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        isOpen: owner.isOpen,
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
      },
    });
  } catch (error) {
    console.error('Owner registration failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

// OWNER LOGIN
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: 'Phone and password are required',
      });
    }

    const owner = await Owner.findOne({ phone });

    if (!owner) {
      return res.status(401).json({
        message: 'Invalid phone number or password',
      });
    }

    const passwordMatch = await bcrypt.compare(password, owner.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid phone number or password',
      });
    }

    res.status(200).json({
      message: 'Login successful',

      owner: {
        id: owner._id,
        shopId: owner.shopId,
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        description: owner.description,
        address: owner.address,
        phone: owner.phone,
        isOpen: owner.isOpen,
        delivery: owner.delivery,
        pickup: owner.pickup,
        categories: owner.categories,
        products: owner.products,
      },
    });
  } catch (error) {
    console.error('Owner login failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;
