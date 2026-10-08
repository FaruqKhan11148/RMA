const {
  runTestSettlement,
} = require('../../services/testBank/testBankSettlement.service');

async function runSettlement(req, res) {
  try {
    const result = await runTestSettlement(req.body);

    return res.status(200).json({
      message: 'Test bank settlement completed successfully',
      settlement: result,
    });
  } catch (error) {
    console.error('Test bank settlement failed:', error);

    return res.status(400).json({
      message: error.message || 'Unable to run test bank settlement',
    });
  }
}

module.exports = {
  runSettlement,
};
