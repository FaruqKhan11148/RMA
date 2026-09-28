const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  getOwnerProducts,
  addProduct,
  changeProductPrice,
  editCustomProduct,
  changeProductAvailability,
  removeProduct,
} = require('./product.controller');

const router = express.Router();

router.get('/products', ownerAuth, getOwnerProducts);

router.post('/products', ownerAuth, addProduct);

router.patch('/products/:productId/price', ownerAuth, changeProductPrice);

router.patch('/products/:productId', ownerAuth, editCustomProduct);

router.patch(
  '/products/:productId/availability',
  ownerAuth,
  changeProductAvailability,
);

router.delete('/products/:productId', ownerAuth, removeProduct);

module.exports = router;
