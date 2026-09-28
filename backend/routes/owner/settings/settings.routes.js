const express = require('express');

const ownerAuth = require('../../../middleware/ownerAuth');

const {
  updateOwnerPhone,
  updateOwnerEmail,
  updateOwnerName,
  updateOwnerPassword,
  updateShopName,
  updateShopDescription,
  updateShopAddress,
  updateShopLocation,
  updateShopOpenClosed,
  updateDeliveryAvailability,
  updatePickupAvailability,
  updateDeliverySettings,
} = require('./settings.controller');

const router = express.Router();

router.patch('/settings/phone', ownerAuth, updateOwnerPhone);

router.patch('/settings/email', ownerAuth, updateOwnerEmail);

router.patch('/settings/owner-name', ownerAuth, updateOwnerName);

router.patch('/settings/password', ownerAuth, updateOwnerPassword);

router.patch('/settings/shop-name', ownerAuth, updateShopName);

router.patch('/settings/description', ownerAuth, updateShopDescription);

router.patch('/settings/address', ownerAuth, updateShopAddress);

router.patch('/settings/location', ownerAuth, updateShopLocation);

router.patch('/settings/open-closed', ownerAuth, updateShopOpenClosed);

router.patch(
  '/settings/delivery-available',
  ownerAuth,
  updateDeliveryAvailability,
);

router.patch('/settings/pickup-available', ownerAuth, updatePickupAvailability);

router.patch('/settings/delivery-settings', ownerAuth, updateDeliverySettings);

module.exports = router;
