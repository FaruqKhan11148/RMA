const express = require('express');

const Owner = require('../models/Owner');

const router = express.Router();

// GET SHOP BY SHOP ID
router.get('/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Owner.findOne({ shopId });

    if (!shop) {
      return res.status(404).json({
        message: 'Shop not found',
      });
    }

    res.status(200).json({
      shop: {
        shopId: shop.shopId,
        ownerName: shop.ownerName,
        shopName: shop.shopName,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        isOpen: shop.isOpen,
        delivery: shop.delivery,
        pickup: shop.pickup,
        categories: shop.categories,
        products: shop.products,
      },
    });
  } catch (error) {
    console.error('Get shop failed:', error.message);

    res.status(500).json({
      message: 'Server error',
    });
  }
});

module.exports = router;
