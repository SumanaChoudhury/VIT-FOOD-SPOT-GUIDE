const { connectDB, execute, queryOne } = require('../server/config/db');

async function ensureGuest() {
  await connectDB();
  const existing = await queryOne("SELECT id FROM users WHERE id = 'guest_student'");
  if (!existing) {
    await execute(
      "INSERT INTO users (id, email, password_hash, name, role) VALUES ('guest_student', 'guest.student@vitstudent.ac.in', 'hash', 'Guest Student', 'student')"
    );
    console.log('Inserted guest_student into users');
  } else {
    console.log('guest_student already exists');
  }
  process.exit(0);
}

ensureGuest().catch(err => {
  console.error(err);
  process.exit(1);
});
