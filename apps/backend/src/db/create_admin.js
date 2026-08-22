const { query } = require('./connection');
const bcrypt = require('bcryptjs');

const run = async () => {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node create_admin.js <email> <password>');
    process.exit(1);
  }

  const email = args[0];
  const password = args[1];

  try {
    // Hash password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, password_hash, user_type, student_id, created_at, updated_at)
      VALUES ($1, $2, 'ADMIN', NULL, NOW(), NOW())
      RETURNING id, username, user_type;
    `;
    const result = await query(sql, [email, passwordHash]);
    console.log('Admin user created successfully:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
};

run();
