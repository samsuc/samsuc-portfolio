/**
 * Create the first admin user.
 * Usage: node src/scripts/createAdmin.js email@example.com "YourPassword123" "Samuel Success"
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createUser, findByEmail } = require('../services/userStore');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.error('Usage: node src/scripts/createAdmin.js <email> <password> [name]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  if (findByEmail(email)) {
    console.error('User already exists:', email);
    process.exit(1);
  }

  const user = await createUser({ email, password, name });
  console.log('Admin created successfully:');
  console.log(user);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
