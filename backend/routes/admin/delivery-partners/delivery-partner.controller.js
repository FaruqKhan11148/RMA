const DeliveryPerson = require('../../../models/DeliveryPerson');
const TestBankAccount = require('../../../models/TestBankAccount');

// ============================================================
// GET PENDING RMA DELIVERY PARTNERS
// ============================================================

const getPendingDeliveryPartners = async (req, res) => {
  try {
    const pendingPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
      applicationStatus: 'UNDER_REVIEW',
    })
      .select('name phone deliveryType isActive applicationStatus createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      deliveryPartners: pendingPartners.map((partner) => ({
        id: partner._id,
        name: partner.name,
        phone: partner.phone,
        deliveryType: partner.deliveryType,
        isActive: partner.isActive,
        applicationStatus: partner.applicationStatus,
        createdAt: partner.createdAt,
      })),
    });
  } catch (error) {
    console.error('Pending RMA delivery partners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch pending delivery partners',
    });
  }
};

// ============================================================
// APPROVE RMA DELIVERY PARTNER
// ============================================================
const approveDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (deliveryPerson.applicationStatus !== 'UNDER_REVIEW') {
      return res.status(400).json({
        message: 'Application is not under review',
      });
    }

    const missingVerifications = [];

    if (deliveryPerson.kyc?.status !== 'VERIFIED') {
      missingVerifications.push('KYC');
    }

    if (deliveryPerson.drivingLicence?.status !== 'VERIFIED') {
      missingVerifications.push('Driving Licence');
    }

    if (deliveryPerson.vehicle?.status !== 'VERIFIED') {
      missingVerifications.push('Vehicle');
    }

    if (deliveryPerson.bankAccount?.status !== 'VERIFIED') {
      missingVerifications.push('Bank Account');
    }

    if (missingVerifications.length > 0) {
      return res.status(400).json({
        message: 'All required documents must be verified before approval',
        missingVerifications,
      });
    }

    // ========================================
    // FIND EXISTING TESTBANK DP ACCOUNT
    // ========================================

    let testBankAccount = await TestBankAccount.findOne({
      accountType: 'DELIVERY_PARTNER',
      deliveryPersonId: deliveryPerson._id,
    });

    // ========================================
    // CREATE TESTBANK DP ACCOUNT
    // ========================================

    if (!testBankAccount) {
      const testAccountNumber = `RMA-DP-${deliveryPerson._id}`;

      testBankAccount = await TestBankAccount.create({
        accountNumber: testAccountNumber,

        accountName: deliveryPerson.name,

        accountType: 'DELIVERY_PARTNER',

        deliveryPersonId: deliveryPerson._id,

        balance: 0,
        availableBalance: 0,
        heldBalance: 0,

        currency: 'INR',

        status: 'ACTIVE',
      });
    }

    // ========================================
    // APPROVE DELIVERY PARTNER
    // ========================================

    deliveryPerson.applicationStatus = 'APPROVED';

    deliveryPerson.isActive = true;

    deliveryPerson.availabilityStatus = 'OFFLINE';

    deliveryPerson.reviewedAt = new Date();

    deliveryPerson.correctionReason = null;
    deliveryPerson.rejectionReason = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Delivery partner application approved successfully',

      deliveryPartner: {
        id: deliveryPerson._id,

        name: deliveryPerson.name,

        applicationStatus: deliveryPerson.applicationStatus,

        isActive: deliveryPerson.isActive,

        availabilityStatus: deliveryPerson.availabilityStatus,

        reviewedAt: deliveryPerson.reviewedAt,
      },

      testBankAccount: {
        id: testBankAccount._id,
        accountNumber: testBankAccount.accountNumber,
        accountName: testBankAccount.accountName,
        accountType: testBankAccount.accountType,
        balance: testBankAccount.balance,
        availableBalance: testBankAccount.availableBalance,
        heldBalance: testBankAccount.heldBalance,
        status: testBankAccount.status,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner approval error:', error);

    return res.status(500).json({
      message: 'Failed to approve delivery partner',
    });
  }
};

const rejectDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    deliveryPerson.isActive = false;
    deliveryPerson.applicationStatus = 'REJECTED';
    deliveryPerson.rejectionReason =
      rejectionReason?.trim() || 'Application did not meet our criteria';
    deliveryPerson.reviewedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'RMA delivery partner rejected successfully',
      deliveryPerson: {
        id: deliveryPerson._id,
        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,
        isActive: deliveryPerson.isActive,
        applicationStatus: deliveryPerson.applicationStatus,
        rejectionReason: deliveryPerson.rejectionReason,
        reviewedAt: deliveryPerson.reviewedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner rejection error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

// ============================================================
// GET RMA DELIVERY PARTNER APPLICATION
// ============================================================

const getDeliveryPartnerApplication = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    }).lean();

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner application not found',
      });
    }

    return res.status(200).json({
      deliveryPartner: {
        id: deliveryPerson._id,

        name: deliveryPerson.name,
        phone: deliveryPerson.phone,
        deliveryType: deliveryPerson.deliveryType,

        profile: {
          dateOfBirth: deliveryPerson.profile?.dateOfBirth || null,
          profilePhotoUrl: deliveryPerson.profile?.profilePhotoUrl || null,
        },

        address: {
          addressLine: deliveryPerson.address?.addressLine || '',
          city: deliveryPerson.address?.city || '',
          state: deliveryPerson.address?.state || '',
          pincode: deliveryPerson.address?.pincode || '',
        },

        kyc: {
          documentType: deliveryPerson.kyc?.documentType || null,
          documentNumber: deliveryPerson.kyc?.documentNumber || null,
          frontImageUrl: deliveryPerson.kyc?.frontImageUrl || null,
          backImageUrl: deliveryPerson.kyc?.backImageUrl || null,
          selfieImageUrl: deliveryPerson.kyc?.selfieImageUrl || null,
          status: deliveryPerson.kyc?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.kyc?.rejectionReason || null,
          verifiedAt: deliveryPerson.kyc?.verifiedAt || null,
        },

        drivingLicence: {
          number: deliveryPerson.drivingLicence?.number || null,
          frontImageUrl: deliveryPerson.drivingLicence?.frontImageUrl || null,
          backImageUrl: deliveryPerson.drivingLicence?.backImageUrl || null,
          expiryDate: deliveryPerson.drivingLicence?.expiryDate || null,
          status: deliveryPerson.drivingLicence?.status || 'NOT_SUBMITTED',
          rejectionReason:
            deliveryPerson.drivingLicence?.rejectionReason || null,
          verifiedAt: deliveryPerson.drivingLicence?.verifiedAt || null,
        },

        vehicle: {
          type: deliveryPerson.vehicle?.type || null,
          registrationNumber:
            deliveryPerson.vehicle?.registrationNumber || null,
          rcImageUrl: deliveryPerson.vehicle?.rcImageUrl || null,
          insuranceImageUrl: deliveryPerson.vehicle?.insuranceImageUrl || null,
          insuranceExpiry: deliveryPerson.vehicle?.insuranceExpiry || null,
          pucImageUrl: deliveryPerson.vehicle?.pucImageUrl || null,
          pucExpiry: deliveryPerson.vehicle?.pucExpiry || null,
          status: deliveryPerson.vehicle?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.vehicle?.rejectionReason || null,
          verifiedAt: deliveryPerson.vehicle?.verifiedAt || null,
        },

        bankAccount: {
          accountHolderName:
            deliveryPerson.bankAccount?.accountHolderName || null,
          accountNumber: deliveryPerson.bankAccount?.accountNumber || null,
          ifsc: deliveryPerson.bankAccount?.ifsc || null,
          bankName: deliveryPerson.bankAccount?.bankName || null,
          proofImageUrl: deliveryPerson.bankAccount?.proofImageUrl || null,
          status: deliveryPerson.bankAccount?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.bankAccount?.rejectionReason || null,
          verifiedAt: deliveryPerson.bankAccount?.verifiedAt || null,
        },

        applicationStatus: deliveryPerson.applicationStatus,
        submittedAt: deliveryPerson.submittedAt,
        correctionReason: deliveryPerson.correctionReason,
        rejectionReason: deliveryPerson.rejectionReason,
        reviewedAt: deliveryPerson.reviewedAt,
        isActive: deliveryPerson.isActive,
        createdAt: deliveryPerson.createdAt,
        updatedAt: deliveryPerson.updatedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner application fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch delivery partner application',
    });
  }
};

// ============================================================
// VERIFY RMA DELIVERY PARTNER KYC
// ============================================================

const verifyDeliveryPartnerKyc = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for KYC verification',
      });
    }

    if (
      !deliveryPerson.kyc?.documentType ||
      !deliveryPerson.kyc?.documentNumber ||
      !deliveryPerson.kyc?.frontImageUrl ||
      !deliveryPerson.kyc?.backImageUrl ||
      !deliveryPerson.kyc?.selfieImageUrl
    ) {
      return res.status(400).json({
        message: 'KYC information is incomplete',
      });
    }

    deliveryPerson.kyc.status = 'VERIFIED';
    deliveryPerson.kyc.rejectionReason = null;
    deliveryPerson.kyc.verifiedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'KYC verified successfully',
      kyc: {
        status: deliveryPerson.kyc.status,
        verifiedAt: deliveryPerson.kyc.verifiedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner KYC verification error:', error);

    return res.status(500).json({
      message: 'Failed to verify KYC',
    });
  }
};

// ============================================================
// REJECT RMA DELIVERY PARTNER KYC
// ============================================================

const rejectDeliveryPartnerKyc = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for KYC review',
      });
    }

    const reason = rejectionReason?.trim();

    if (!reason) {
      return res.status(400).json({
        message: 'KYC rejection reason is required',
      });
    }

    deliveryPerson.kyc.status = 'REJECTED';
    deliveryPerson.kyc.rejectionReason = reason;
    deliveryPerson.kyc.verifiedAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'KYC rejected successfully',
      kyc: {
        status: deliveryPerson.kyc.status,
        rejectionReason: deliveryPerson.kyc.rejectionReason,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner KYC rejection error:', error);

    return res.status(500).json({
      message: 'Failed to reject KYC',
    });
  }
};

// ============================================================
// VERIFY RMA DELIVERY PARTNER DRIVING LICENCE
// ============================================================

const verifyDeliveryPartnerDrivingLicence = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for driving licence verification',
      });
    }

    if (
      !deliveryPerson.drivingLicence?.number ||
      !deliveryPerson.drivingLicence?.frontImageUrl ||
      !deliveryPerson.drivingLicence?.backImageUrl ||
      !deliveryPerson.drivingLicence?.expiryDate
    ) {
      return res.status(400).json({
        message: 'Driving licence information is incomplete',
      });
    }

    const expiryDate = new Date(deliveryPerson.drivingLicence.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      return res.status(400).json({
        message: 'Invalid driving licence expiry date',
      });
    }

    if (expiryDate < new Date()) {
      return res.status(400).json({
        message: 'Driving licence has expired',
      });
    }

    deliveryPerson.drivingLicence.status = 'VERIFIED';
    deliveryPerson.drivingLicence.rejectionReason = null;
    deliveryPerson.drivingLicence.verifiedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Driving licence verified successfully',
      drivingLicence: {
        status: deliveryPerson.drivingLicence.status,
        verifiedAt: deliveryPerson.drivingLicence.verifiedAt,
      },
    });
  } catch (error) {
    console.error(
      'RMA delivery partner driving licence verification error:',
      error,
    );

    return res.status(500).json({
      message: 'Failed to verify driving licence',
    });
  }
};

// ============================================================
// REJECT RMA DELIVERY PARTNER DRIVING LICENCE
// ============================================================

const rejectDeliveryPartnerDrivingLicence = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for driving licence review',
      });
    }

    const reason = rejectionReason?.trim();

    if (!reason) {
      return res.status(400).json({
        message: 'Driving licence rejection reason is required',
      });
    }

    deliveryPerson.drivingLicence.status = 'REJECTED';
    deliveryPerson.drivingLicence.rejectionReason = reason;
    deliveryPerson.drivingLicence.verifiedAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Driving licence rejected successfully',
      drivingLicence: {
        status: deliveryPerson.drivingLicence.status,
        rejectionReason: deliveryPerson.drivingLicence.rejectionReason,
      },
    });
  } catch (error) {
    console.error(
      'RMA delivery partner driving licence rejection error:',
      error,
    );

    return res.status(500).json({
      message: 'Failed to reject driving licence',
    });
  }
};

// ============================================================
// VERIFY RMA DELIVERY PARTNER VEHICLE
// ============================================================

const verifyDeliveryPartnerVehicle = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for vehicle verification',
      });
    }

    const vehicle = deliveryPerson.vehicle;

    if (
      !vehicle?.type ||
      !vehicle?.registrationNumber ||
      !vehicle?.rcImageUrl ||
      !vehicle?.insuranceImageUrl ||
      !vehicle?.insuranceExpiry ||
      !vehicle?.pucImageUrl ||
      !vehicle?.pucExpiry
    ) {
      return res.status(400).json({
        message: 'Vehicle information is incomplete',
      });
    }

    const insuranceExpiry = new Date(vehicle.insuranceExpiry);
    const pucExpiry = new Date(vehicle.pucExpiry);

    if (
      Number.isNaN(insuranceExpiry.getTime()) ||
      Number.isNaN(pucExpiry.getTime())
    ) {
      return res.status(400).json({
        message: 'Invalid vehicle document expiry date',
      });
    }

    const now = new Date();

    if (insuranceExpiry < now) {
      return res.status(400).json({
        message: 'Vehicle insurance has expired',
      });
    }

    if (pucExpiry < now) {
      return res.status(400).json({
        message: 'Vehicle PUC has expired',
      });
    }

    deliveryPerson.vehicle.status = 'VERIFIED';
    deliveryPerson.vehicle.rejectionReason = null;
    deliveryPerson.vehicle.verifiedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Vehicle verified successfully',
      vehicle: {
        status: deliveryPerson.vehicle.status,
        verifiedAt: deliveryPerson.vehicle.verifiedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner vehicle verification error:', error);

    return res.status(500).json({
      message: 'Failed to verify vehicle',
    });
  }
};

// ============================================================
// REJECT RMA DELIVERY PARTNER VEHICLE
// ============================================================

const rejectDeliveryPartnerVehicle = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for vehicle review',
      });
    }

    const reason = rejectionReason?.trim();

    if (!reason) {
      return res.status(400).json({
        message: 'Vehicle rejection reason is required',
      });
    }

    deliveryPerson.vehicle.status = 'REJECTED';
    deliveryPerson.vehicle.rejectionReason = reason;
    deliveryPerson.vehicle.verifiedAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Vehicle rejected successfully',
      vehicle: {
        status: deliveryPerson.vehicle.status,
        rejectionReason: deliveryPerson.vehicle.rejectionReason,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner vehicle rejection error:', error);

    return res.status(500).json({
      message: 'Failed to reject vehicle',
    });
  }
};

const verifyDeliveryPartnerBank = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for bank verification',
      });
    }

    const bankAccount = deliveryPerson.bankAccount;

    if (
      !bankAccount?.accountHolderName ||
      !bankAccount?.accountNumber ||
      !bankAccount?.ifsc ||
      !bankAccount?.bankName ||
      !bankAccount?.proofImageUrl
    ) {
      return res.status(400).json({
        message: 'Bank account information is incomplete',
      });
    }

    deliveryPerson.bankAccount.status = 'VERIFIED';
    deliveryPerson.bankAccount.rejectionReason = null;
    deliveryPerson.bankAccount.verifiedAt = new Date();

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Bank account verified successfully',
      bankAccount: {
        status: deliveryPerson.bankAccount.status,
        verifiedAt: deliveryPerson.bankAccount.verifiedAt,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner bank verification error:', error);

    return res.status(500).json({
      message: 'Failed to verify bank account',
    });
  }
};

const rejectDeliveryPartnerBank = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params;
    const { rejectionReason } = req.body;

    const deliveryPerson = await DeliveryPerson.findOne({
      _id: deliveryPersonId,
      deliveryType: 'RMA',
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        message: 'RMA delivery partner not found',
      });
    }

    if (
      deliveryPerson.applicationStatus !== 'UNDER_REVIEW' &&
      deliveryPerson.applicationStatus !== 'CORRECTION_REQUIRED'
    ) {
      return res.status(400).json({
        message: 'Application is not ready for bank review',
      });
    }

    const reason = rejectionReason?.trim();

    if (!reason) {
      return res.status(400).json({
        message: 'Bank account rejection reason is required',
      });
    }

    deliveryPerson.bankAccount.status = 'REJECTED';
    deliveryPerson.bankAccount.rejectionReason = reason;
    deliveryPerson.bankAccount.verifiedAt = null;

    await deliveryPerson.save();

    return res.status(200).json({
      message: 'Bank account rejected successfully',
      bankAccount: {
        status: deliveryPerson.bankAccount.status,
        rejectionReason: deliveryPerson.bankAccount.rejectionReason,
      },
    });
  } catch (error) {
    console.error('RMA delivery partner bank rejection error:', error);

    return res.status(500).json({
      message: 'Failed to reject bank account',
    });
  }
};

const getAllRmaDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await DeliveryPerson.find({
      deliveryType: 'RMA',
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      deliveryPartners: deliveryPartners.map((deliveryPerson) => ({
        id: deliveryPerson._id,

        name: deliveryPerson.name || null,
        phone: deliveryPerson.phone || null,

        deliveryType: deliveryPerson.deliveryType || 'RMA',

        profile: {
          dateOfBirth: deliveryPerson.profile?.dateOfBirth || null,
          profilePhotoUrl: deliveryPerson.profile?.profilePhotoUrl || null,
        },

        address: {
          addressLine: deliveryPerson.address?.addressLine || null,
          city: deliveryPerson.address?.city || null,
          state: deliveryPerson.address?.state || null,
          pincode: deliveryPerson.address?.pincode || null,
        },

        kyc: {
          documentType: deliveryPerson.kyc?.documentType || null,
          documentNumber: deliveryPerson.kyc?.documentNumber || null,
          frontImageUrl: deliveryPerson.kyc?.frontImageUrl || null,
          backImageUrl: deliveryPerson.kyc?.backImageUrl || null,
          selfieImageUrl: deliveryPerson.kyc?.selfieImageUrl || null,
          status: deliveryPerson.kyc?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.kyc?.rejectionReason || null,
          verifiedAt: deliveryPerson.kyc?.verifiedAt || null,
        },

        drivingLicence: {
          number: deliveryPerson.drivingLicence?.number || null,
          frontImageUrl: deliveryPerson.drivingLicence?.frontImageUrl || null,
          backImageUrl: deliveryPerson.drivingLicence?.backImageUrl || null,
          expiryDate: deliveryPerson.drivingLicence?.expiryDate || null,
          status: deliveryPerson.drivingLicence?.status || 'NOT_SUBMITTED',
          rejectionReason:
            deliveryPerson.drivingLicence?.rejectionReason || null,
          verifiedAt: deliveryPerson.drivingLicence?.verifiedAt || null,
        },

        vehicle: {
          type: deliveryPerson.vehicle?.type || null,
          registrationNumber:
            deliveryPerson.vehicle?.registrationNumber || null,
          rcImageUrl: deliveryPerson.vehicle?.rcImageUrl || null,
          insuranceImageUrl: deliveryPerson.vehicle?.insuranceImageUrl || null,
          insuranceExpiry: deliveryPerson.vehicle?.insuranceExpiry || null,
          pucImageUrl: deliveryPerson.vehicle?.pucImageUrl || null,
          pucExpiry: deliveryPerson.vehicle?.pucExpiry || null,
          status: deliveryPerson.vehicle?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.vehicle?.rejectionReason || null,
          verifiedAt: deliveryPerson.vehicle?.verifiedAt || null,
        },

        bankAccount: {
          accountHolderName:
            deliveryPerson.bankAccount?.accountHolderName || null,
          accountNumber: deliveryPerson.bankAccount?.accountNumber || null,
          ifsc: deliveryPerson.bankAccount?.ifsc || null,
          bankName: deliveryPerson.bankAccount?.bankName || null,
          proofImageUrl: deliveryPerson.bankAccount?.proofImageUrl || null,
          status: deliveryPerson.bankAccount?.status || 'NOT_SUBMITTED',
          rejectionReason: deliveryPerson.bankAccount?.rejectionReason || null,
          verifiedAt: deliveryPerson.bankAccount?.verifiedAt || null,
        },

        applicationStatus: deliveryPerson.applicationStatus || 'INCOMPLETE',

        submittedAt: deliveryPerson.submittedAt || null,

        correctionReason: deliveryPerson.correctionReason || null,

        rejectionReason: deliveryPerson.rejectionReason || null,

        reviewedAt: deliveryPerson.reviewedAt || null,

        isActive: deliveryPerson.isActive || false,

        availabilityStatus: deliveryPerson.availabilityStatus || 'OFFLINE',

        createdAt: deliveryPerson.createdAt || null,

        updatedAt: deliveryPerson.updatedAt || null,
      })),
    });
  } catch (error) {
    console.error('RMA delivery partners fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch RMA delivery partners',
    });
  }
};

module.exports = {
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
};
