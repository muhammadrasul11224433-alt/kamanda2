// Usage: node scripts/hashPassword.js YourPasswordHere
// Prints a bcrypt hash you can paste into database/seed.sql

const bcrypt = require('bcrypt');

const password = process.argv[2];
if (!password) {
  console.log('Истифода: node scripts/hashPassword.js <parol>');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Bcrypt hash:');
  console.log(hash);
});
