const express = require('express');

const Owner = require('../models/Owner');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

/*
  GET ALL OWNERS
  Protected: Admin only
*/

router.get('/', adminAuth, async (req, res) => {
  try {
    const owners = await Owner.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({
      count: owners.length,
      owners,
    });
  } catch (error) {
    console.error('Admin owners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch owners',
    });
  }
});

/*
  GET SINGLE OWNER
*/

router.get('/:shopId', adminAuth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select('-password');

    if (!owner) {
      return res.status(404).json({
        message: 'Owner/shop not found',
      });
    }

    return res.json({
      owner,
    });
  } catch (error) {
    console.error('Admin owner fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch owner',
    });
  }
});

module.exports = router;
