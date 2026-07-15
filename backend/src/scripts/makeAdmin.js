// ─── КАК ДА СТАНЕШ ADMIN ───
// Изпълни ЛОКАЛНО с: node src/scripts/makeAdmin.js max@test.com
// Скриптът намира потребителя по email и му дава role: "admin".

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: node src/scripts/makeAdmin.js <email>");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true }
  );

  if (!user) {
    console.log(`❌ User with email ${email} not found`);
  } else {
    console.log(`✅ ${user.name} (${user.email}) is now ADMIN`);
    console.log("⚠️  Log out and log in again to get a new token with the admin role.");
  }

  await mongoose.disconnect();
}

makeAdmin();
