const crypto = require('crypto');

const Owner = require('../../../models/Owner');
const Order = require('../../../models/Order');
const TestBankAccount = require('../../../models/TestBankAccount');

// ============================================================
// START PAYU ONBOARDING
// TEST / DUMMY MODE
// ============================================================

const startPayuOnboarding = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    if (owner.payment?.rmaApprovalStatus !== 'APPROVED') {
      return res.status(400).json({
        message:
          'RMA settlement approval is required before starting PayU onboarding',
      });
    }

    if (owner.payment?.onboardingStatus === 'PENDING') {
      return res.status(400).json({
        message: 'PayU onboarding is already in progress',
      });
    }

    if (owner.payment?.onboardingStatus === 'VERIFIED') {
      return res.status(400).json({
        message: 'PayU onboarding is already verified',
      });
    }

    const payuChildMerchantId = `PAYU-TEST-${Date.now()}`;

    const payuChildMerchantUuid = crypto.randomUUID();

    owner.payment.payuChildMerchantId = payuChildMerchantId;

    owner.payment.payuChildMerchantUuid = payuChildMerchantUuid;

    owner.payment.onboardingStatus = 'PENDING';

    owner.payment.bankStatus = 'PENDING';

    owner.payment.kycStatus = 'PENDING';

    await owner.save();

    return res.status(200).json({
      message: 'Dummy PayU onboarding started successfully',

      onboarding: {
        ownerId: owner._id,
        shopId: owner.shopId,

        payuChildMerchantId: owner.payment.payuChildMerchantId,

        payuChildMerchantUuid: owner.payment.payuChildMerchantUuid,

        onboardingStatus: owner.payment.onboardingStatus,

        bankStatus: owner.payment.bankStatus,

        kycStatus: owner.payment.kycStatus,
      },
    });
  } catch (error) {
    console.error('Dummy PayU onboarding failed:', error);

    return res.status(500).json({
      message: 'Failed to start PayU onboarding',
    });
  }
};

// ============================================================
// VERIFY OWNER BANK
// TEST / DUMMY MODE
// ============================================================

const verifyOwnerBank = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    if (owner.payment?.rmaApprovalStatus !== 'APPROVED') {
      return res.status(400).json({
        message: 'RMA settlement approval is required before bank verification',
      });
    }

    if (!owner.payment?.payuChildMerchantId) {
      return res.status(400).json({
        message: 'PayU child merchant must be created before bank verification',
      });
    }

    if (owner.payment?.bankStatus === 'VERIFIED') {
      return res.status(400).json({
        message: 'Bank verification is already completed',
      });
    }

    owner.payment.bankStatus = 'VERIFIED';

    await owner.save();

    return res.status(200).json({
      message: 'Dummy bank verification completed successfully',

      verification: {
        ownerId: owner._id,
        shopId: owner.shopId,

        bankStatus: owner.payment.bankStatus,

        onboardingStatus: owner.payment.onboardingStatus,

        kycStatus: owner.payment.kycStatus,

        payuChildMerchantId: owner.payment.payuChildMerchantId,
      },
    });
  } catch (error) {
    console.error('Dummy bank verification failed:', error);

    return res.status(500).json({
      message: 'Failed to verify owner bank',
    });
  }
};

// ============================================================
// VERIFY OWNER KYC
// TEST / DUMMY MODE
// ============================================================

const verifyOwnerKyc = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    if (owner.payment?.rmaApprovalStatus !== 'APPROVED') {
      return res.status(400).json({
        message: 'RMA settlement approval is required before KYC verification',
      });
    }

    if (!owner.payment?.payuChildMerchantId) {
      return res.status(400).json({
        message: 'PayU child merchant must be created before KYC verification',
      });
    }

    if (owner.payment?.bankStatus !== 'VERIFIED') {
      return res.status(400).json({
        message: 'Bank verification must be completed before KYC verification',
      });
    }

    if (owner.payment?.kycStatus === 'VERIFIED') {
      return res.status(400).json({
        message: 'KYC verification is already completed',
      });
    }

    owner.payment.kycStatus = 'VERIFIED';

    await owner.save();

    return res.status(200).json({
      message: 'Dummy KYC verification completed successfully',

      verification: {
        ownerId: owner._id,
        shopId: owner.shopId,

        bankStatus: owner.payment.bankStatus,

        kycStatus: owner.payment.kycStatus,

        onboardingStatus: owner.payment.onboardingStatus,

        payuChildMerchantId: owner.payment.payuChildMerchantId,
      },
    });
  } catch (error) {
    console.error('Dummy KYC verification failed:', error);

    return res.status(500).json({
      message: 'Failed to verify owner KYC',
    });
  }
};

const completePayuOnboarding = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    if (owner.payment?.rmaApprovalStatus !== 'APPROVED') {
      return res.status(400).json({
        message:
          'RMA settlement approval is required before completing PayU onboarding',
      });
    }

    if (
      !owner.payment?.payuChildMerchantId ||
      !owner.payment?.payuChildMerchantUuid
    ) {
      return res.status(400).json({
        message:
          'PayU child merchant must be created before completing onboarding',
      });
    }

    if (owner.payment?.bankStatus !== 'VERIFIED') {
      return res.status(400).json({
        message: 'Bank verification must be completed first',
      });
    }

    if (owner.payment?.kycStatus !== 'VERIFIED') {
      return res.status(400).json({
        message: 'KYC verification must be completed first',
      });
    }

    if (owner.payment?.onboardingStatus === 'VERIFIED') {
      return res.status(400).json({
        message: 'PayU onboarding is already completed',
      });
    }

    owner.payment.onboardingStatus = 'VERIFIED';

    owner.payment.onboardedAt = new Date();

    await owner.save();

    return res.status(200).json({
      message: 'Dummy PayU onboarding completed successfully',

      onboarding: {
        ownerId: owner._id,
        shopId: owner.shopId,

        payuChildMerchantId: owner.payment.payuChildMerchantId,

        payuChildMerchantUuid: owner.payment.payuChildMerchantUuid,

        bankStatus: owner.payment.bankStatus,

        kycStatus: owner.payment.kycStatus,

        onboardingStatus: owner.payment.onboardingStatus,

        onboardedAt: owner.payment.onboardedAt,
      },
    });
  } catch (error) {
    console.error('Dummy PayU onboarding completion failed:', error);

    return res.status(500).json({
      message: 'Failed to complete PayU onboarding',
    });
  }
};

const getPendingSettlements = async (req, res) => {
  try {
    const owners = await Owner.find({
      'payment.rmaApprovalStatus': 'PENDING',
    })
      .select('ownerName shopName shopId phone email payment createdAt')
      .sort({ createdAt: -1 });

    const settlements = owners.map((owner) => {
      const accountNumber = owner.payment?.bankAccountNumber || '';

      const maskedAccountNumber =
        accountNumber.length > 4 ? `****${accountNumber.slice(-4)}` : '****';

      return {
        ownerId: owner._id,
        ownerName: owner.ownerName,
        shopName: owner.shopName,
        shopId: owner.shopId,
        phone: owner.phone,
        email: owner.email,

        bank: {
          holderName: owner.payment?.bankHolderName || '',
          accountNumber: maskedAccountNumber,
          ifscCode: owner.payment?.ifscCode || '',
        },

        rmaApprovalStatus: owner.payment?.rmaApprovalStatus || 'PENDING',

        bankStatus: owner.payment?.bankStatus || 'NOT_STARTED',

        onboardingStatus: owner.payment?.onboardingStatus || 'NOT_STARTED',

        createdAt: owner.createdAt,
      };
    });

    return res.status(200).json({
      count: settlements.length,
      settlements,
    });
  } catch (error) {
    console.error('Admin settlement fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch pending settlements',
    });
  }
};

const approveOwnerSettlement = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    if (!owner.payment?.bankAccountNumber) {
      return res.status(400).json({
        message: 'Bank details are not available',
      });
    }

    if (!owner.payment?.bankHolderName) {
      return res.status(400).json({
        message: 'Bank account holder name is missing',
      });
    }

    if (!owner.payment?.ifscCode) {
      return res.status(400).json({
        message: 'IFSC code is missing',
      });
    }

    if (owner.payment.rmaApprovalStatus === 'APPROVED') {
      return res.status(400).json({
        message: 'Settlement is already approved',
      });
    }

    // ========================================
    // CREATE / FIND TESTBANK OWNER ACCOUNT
    // ========================================

    let testBankAccount = await TestBankAccount.findOne({
      accountType: 'OWNER',
      ownerId: owner._id,
    });

    if (!testBankAccount) {
      const testAccountNumber = `RMA-OWNER-${owner.shopId}`;

      testBankAccount = await TestBankAccount.create({
        accountNumber: testAccountNumber,

        accountName: owner.shopName,

        accountType: 'OWNER',

        ownerId: owner._id,

        balance: 0,
        availableBalance: 0,
        heldBalance: 0,

        currency: 'INR',

        status: 'ACTIVE',
      });
    }

    // ========================================
    // APPROVE OWNER SETTLEMENT
    // ========================================

    owner.payment.rmaApprovalStatus = 'APPROVED';

    owner.payment.rmaApprovedAt = new Date();

    owner.payment.rmaRejectedAt = null;

    await owner.save();

    return res.status(200).json({
      message: 'Owner settlement approved successfully',

      settlement: {
        ownerId: owner._id,
        shopId: owner.shopId,

        rmaApprovalStatus: owner.payment.rmaApprovalStatus,

        rmaApprovedAt: owner.payment.rmaApprovedAt,

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
      },
    });
  } catch (error) {
    console.error('Admin settlement approval error:', error);

    return res.status(500).json({
      message: 'Failed to approve owner settlement',
    });
  }
};

const rejectOwnerSettlement = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await Owner.findById(ownerId);

    if (!owner) {
      return res.status(404).json({
        message: 'Owner not found',
      });
    }

    owner.payment.rmaApprovalStatus = 'REJECTED';

    owner.payment.rmaRejectedAt = new Date();

    owner.payment.rmaApprovedAt = null;

    await owner.save();

    return res.status(200).json({
      message: 'Owner settlement rejected successfully',

      settlement: {
        ownerId: owner._id,
        shopId: owner.shopId,
        rmaApprovalStatus: owner.payment.rmaApprovalStatus,
        rmaRejectedAt: owner.payment.rmaRejectedAt,
      },
    });
  } catch (error) {
    console.error('Admin settlement rejection error:', error);

    return res.status(500).json({
      message: 'Failed to reject owner settlement',
    });
  }
};

const getAllOwners = async (req, res) => {
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
};

const getShopStatistics = async (req, res) => {
  try {
    const { shopId } = req.params;

    const owner = await Owner.findOne({ shopId }).select(
      'ownerName shopName phone shopId',
    );

    if (!owner) {
      return res.status(404).json({
        message: 'Owner/shop not found',
      });
    }

    const orders = await Order.find({
      ownerId: owner._id,
    }).select(
      [
        'orderId',
        'totalPrice',
        'status',
        'paymentStatus',
        'paymentMethod',
        'createdAt',
        'completedAt',
      ].join(' '),
    );

    let totalTransactionValue = 0;
    let completedTransactionValue = 0;
    let totalRmaFees = 0;

    const statusCounts = {
      Pending: 0,
      Accepted: 0,
      Preparing: 0,
      Ready: 0,
      OutForDelivery: 0,
      Completed: 0,
      Rejected: 0,
    };

    for (const order of orders) {
      const amount = Number(order.totalPrice || 0);

      totalTransactionValue += amount;

      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status] += 1;
      }

      if (order.status === 'Completed' && order.paymentStatus === 'Paid') {
        completedTransactionValue += amount;

        // RMA platform fee = 2.5%
        totalRmaFees += amount * 0.025;
      }
    }

    return res.status(200).json({
      shop: {
        shopId: owner.shopId,
        shopName: owner.shopName,
        ownerName: owner.ownerName,
        phone: owner.phone,
      },

      stats: {
        totalOrders: orders.length,

        completedOrders: statusCounts.Completed,

        totalTransactionValue: Number(totalTransactionValue.toFixed(2)),

        completedTransactionValue: Number(completedTransactionValue.toFixed(2)),

        totalRmaFees: Number(totalRmaFees.toFixed(2)),
      },

      orderStatus: statusCounts,

      recentOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error('Admin shop statistics fetch error:', error);

    return res.status(500).json({
      message: 'Failed to fetch shop statistics',
    });
  }
};

const getSingleOwner = async (req, res) => {
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
};

module.exports = {
  startPayuOnboarding,
  verifyOwnerBank,
  verifyOwnerKyc,
  completePayuOnboarding,
  getPendingSettlements,
  approveOwnerSettlement,
  rejectOwnerSettlement,
  getAllOwners,
  getShopStatistics,
  getSingleOwner,
};
