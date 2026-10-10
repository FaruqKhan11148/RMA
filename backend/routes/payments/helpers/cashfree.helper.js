const { Cashfree } = require('cashfree-pg');

const appId = process.env.CASHFREE_APP_ID;
const secretKey = process.env.CASHFREE_SECRET_KEY;

const environment = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();

if (!appId || !secretKey) {
  throw new Error(
    'Cashfree credentials are missing from backend environment variables',
  );
}

if (!['sandbox', 'production'].includes(environment)) {
  throw new Error('CASHFREE_ENV must be either sandbox or production');
}

const cashfree = new Cashfree(
  environment === 'production' ? 'PRODUCTION' : 'SANDBOX',
  appId,
  secretKey,
);

module.exports = { cashfree };
