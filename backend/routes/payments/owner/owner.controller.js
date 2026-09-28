// PAYU OWNER ONBOARDING

async function onboardOwner(req, res) {
  return res.status(501).json({
    message:
      'PayU owner marketplace onboarding will be implemented after PayU aggregator/split settlement activation.',
  });
}

module.exports = {
  onboardOwner,
};
