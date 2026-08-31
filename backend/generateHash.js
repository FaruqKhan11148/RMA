const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'RMA@12345';

  const hash = await bcrypt.hash(password, 10);

  console.log('Password:', password);
  console.log('Hash:', hash);
}

generateHash();
