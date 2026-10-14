const dns = require('dns');

dns.setServers(['8.8.8.8']);

require('dotenv').config();

const mongoose = require('mongoose');
const PaymentRefund = require('./models/PaymentRefund');

async function checkRefundIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const indexes = await PaymentRefund.collection.indexes();

    console.log('\nPaymentRefund indexes:');
    console.dir(
      indexes.filter(
        (index) =>
          index.name === 'one_active_refund_per_order' ||
          index.key?.order === 1,
      ),
      { depth: null },
    );
  } catch (error) {
    console.error('Index check failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkRefundIndexes();
