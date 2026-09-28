const crypto = require('crypto');

const PAYU_PAYMENT_URL =
  process.env.PAYU_ENV === 'live'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// PAYU HASH HELPER
function generatePayUHash({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
}) {
  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|` +
    `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||` +
    `${process.env.PAYU_SALT}`;

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// PAYU RESPONSE HASH VERIFICATION
function generatePayUResponseHash(data) {
  const {
    additionalCharges,
    additional_charges,
    status,
    udf5 = '',
    udf4 = '',
    udf3 = '',
    udf2 = '',
    udf1 = '',
    email = '',
    firstname = '',
    productinfo = '',
    amount = '',
    txnid = '',
    key = '',
  } = data;

  const extraCharges = additionalCharges || additional_charges || '';

  let hashString;

  if (extraCharges) {
    hashString =
      `${extraCharges}|${process.env.PAYU_SALT}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|` +
      `${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString =
      `${process.env.PAYU_SALT}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|` +
      `${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// CONSTANT-TIME HASH COMPARISON
function hashesMatch(hash1, hash2) {
  if (!hash1 || !hash2) {
    return false;
  }

  const first = Buffer.from(hash1, 'utf8');
  const second = Buffer.from(hash2, 'utf8');

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

module.exports = {
  PAYU_PAYMENT_URL,
  FRONTEND_URL,
  BACKEND_URL,
  generatePayUHash,
  generatePayUResponseHash,
  hashesMatch,
};
