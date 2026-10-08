const {
  receiveCustomerPayment,
  settleOwnerAmount,
  creditRmaFee,
  holdDeliveryEarning,
  releaseDeliveryEarning,
  withdrawDeliveryPartnerMoney,
  recordPayUFeeLiability,
  deductPayUFee,
} = require('../../services/testBank/testBankLedger.service');

// ============================================================
// RECEIVE CUSTOMER PAYMENT
// ============================================================

async function receivePayment(req, res) {
  try {
    const {
      payuAccountId,
      amount,
      referenceId = null,
      description = 'Customer payment received by PayU',
      metadata = {},
    } = req.body;

    const result = await receiveCustomerPayment({
      payuAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Customer payment received successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank receive payment failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to receive payment',
    });
  }
}

// ============================================================
// OWNER SETTLEMENT
// ============================================================

async function settleOwner(req, res) {
  try {
    const {
      payuAccountId,
      ownerAccountId,
      amount,
      referenceId = null,
      description = 'Owner settlement',
      metadata = {},
    } = req.body;

    const result = await settleOwnerAmount({
      payuAccountId,
      ownerAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Owner amount settled successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank owner settlement failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to settle owner amount',
    });
  }
}

// ============================================================
// RMA FEE
// ============================================================

async function creditRma(req, res) {
  try {
    const {
      payuAccountId,
      rmaAccountId,
      amount,
      referenceId = null,
      description = 'RMA platform fee',
      metadata = {},
    } = req.body;

    const result = await creditRmaFee({
      payuAccountId,
      rmaAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'RMA fee credited successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank RMA fee failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to credit RMA fee',
    });
  }
}

// ============================================================
// HOLD DP EARNING
// ============================================================

async function holdDpEarning(req, res) {
  try {
    const {
      payuAccountId,
      dpAccountId,
      amount,
      referenceId = null,
      description = 'Delivery partner earning held',
      metadata = {},
    } = req.body;

    const result = await holdDeliveryEarning({
      payuAccountId,
      dpAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Delivery earning held successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank DP earning hold failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to hold DP earning',
    });
  }
}

// ============================================================
// RELEASE DP EARNING
// ============================================================

async function releaseDpEarning(req, res) {
  try {
    const {
      dpAccountId,
      amount,
      referenceId = null,
      description = 'Delivery earning released',
      metadata = {},
    } = req.body;

    const result = await releaseDeliveryEarning({
      dpAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Delivery earning released successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank DP earning release failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to release DP earning',
    });
  }
}

// ============================================================
// DP WITHDRAWAL
// ============================================================

async function withdrawDp(req, res) {
  try {
    const {
      dpAccountId,
      amount,
      referenceId = null,
      description = 'Delivery partner withdrawal',
      metadata = {},
    } = req.body;

    const result = await withdrawDeliveryPartnerMoney({
      dpAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'Delivery partner withdrawal completed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank DP withdrawal failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to withdraw DP money',
    });
  }
}

// ============================================================
// PAYU FEE LIABILITY
// ============================================================

async function createPayuFeeLiability(req, res) {
  try {
    const {
      rmaAccountId,
      amount,
      referenceId = null,
      description = 'PayU processing fee liability',
      metadata = {},
    } = req.body;

    const result = await recordPayUFeeLiability({
      rmaAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'PayU fee liability recorded successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank PayU fee liability failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to record PayU fee liability',
    });
  }
}

// ============================================================
// PAYU FEE DEDUCTION
// ============================================================

async function deductPayuFee(req, res) {
  try {
    const {
      rmaAccountId,
      payuAccountId,
      amount,
      referenceId = null,
      description = 'PayU processing fee deducted',
      metadata = {},
    } = req.body;

    const result = await deductPayUFee({
      rmaAccountId,
      payuAccountId,
      amount,
      referenceId,
      description,
      metadata,
    });

    return res.status(200).json({
      message: 'PayU fee deducted successfully',
      ...result,
    });
  } catch (error) {
    console.error('Test bank PayU fee deduction failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to deduct PayU fee',
    });
  }
}

module.exports = {
  receivePayment,
  settleOwner,
  creditRma,
  holdDpEarning,
  releaseDpEarning,
  withdrawDp,
  createPayuFeeLiability,
  deductPayuFee,
};
