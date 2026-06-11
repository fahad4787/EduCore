/**
 * fix_passwords.js
 * Sets password for every Student and Professor to: firstname123
 * Example: "Priya Sharma" → password = "priya123"
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
  console.log('✅ Connected\n');

  const users = await User.find({ role: { $in: ['Student', 'Professor'] } });
  console.log(`👥 Found ${users.length} users to update\n`);

  let updated = 0;

  for (const user of users) {
    const firstName = user.name.trim().split(/\s+/)[0].toLowerCase();
    const plainPwd  = `${firstName}123`;
    const hashed    = await bcrypt.hash(plainPwd, 10);

    user.password = hashed;
    await user.save();

    console.log(`   ✔ [${user.role.padEnd(9)}] ${user.name.padEnd(25)} → ${plainPwd}`);
    updated++;
  }

  console.log(`\n✅ Updated passwords for ${updated} users`);
  console.log('   Format: firstname123 (all lowercase)\n');
  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
