const express = require('express');

const adminAuth = require('../../../middleware/adminAuth');

const {
  getPendingDeliveryPartners,
  getDeliveryPartnerApplication,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  verifyDeliveryPartnerKyc,
  rejectDeliveryPartnerKyc,
  verifyDeliveryPartnerDrivingLicence,
  rejectDeliveryPartnerDrivingLicence,
  verifyDeliveryPartnerVehicle,
  rejectDeliveryPartnerVehicle,
  verifyDeliveryPartnerBank,
  rejectDeliveryPartnerBank,
  getAllRmaDeliveryPartners,
} = require('./delivery-partner.controller');

const router = express.Router();

router.get('/delivery-partners/pending', adminAuth, getPendingDeliveryPartners);

router.get('/delivery-partners/all', adminAuth, getAllRmaDeliveryPartners);

router.get(
  '/delivery-partners/:deliveryPersonId',
  adminAuth,
  getDeliveryPartnerApplication,
);

router.patch(
  '/rma/:deliveryPersonId/approve',
  adminAuth,
  approveDeliveryPartner,
);

router.patch('/rma/:deliveryPersonId/reject', adminAuth, rejectDeliveryPartner);

router.patch(
  '/delivery-partners/:deliveryPersonId/kyc/verify',
  adminAuth,
  verifyDeliveryPartnerKyc,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/kyc/reject',
  adminAuth,
  rejectDeliveryPartnerKyc,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/driving-licence/verify',
  adminAuth,
  verifyDeliveryPartnerDrivingLicence,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/driving-licence/reject',
  adminAuth,
  rejectDeliveryPartnerDrivingLicence,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/vehicle/verify',
  adminAuth,
  verifyDeliveryPartnerVehicle,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/vehicle/reject',
  adminAuth,
  rejectDeliveryPartnerVehicle,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/bank/verify',
  adminAuth,
  verifyDeliveryPartnerBank,
);

router.patch(
  '/delivery-partners/:deliveryPersonId/bank/reject',
  adminAuth,
  rejectDeliveryPartnerBank,
);

module.exports = router;
