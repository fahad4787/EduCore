/**
 * fix_student_emails.js
 * Updates all student emails to: firstnamelastnameyear@gmail.com
 * Example: John Doe (DOB 2005) → johndoe2005@gmail.com
 */
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
  console.log('✅ Connected\n');

  const students = await User.find({ role: 'Student' });
  console.log(`🎓 Found ${students.length} students\n`);

  const usedEmails = new Set();

  // Pre-load non-student emails to avoid collisions
  const otherUsers = await User.find({ role: { $ne: 'Student' } }, 'email');
  otherUsers.forEach(u => usedEmails.add(u.email.toLowerCase()));

  let updated = 0;

  for (const student of students) {
    const nameParts = student.name.trim().split(/\s+/);
    const firstName = nameParts[0].toLowerCase();
    const lastName  = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';

    // Get DOB year — fallback to admissionDate year or 2003
    const year = student.dateOfBirth
      ? new Date(student.dateOfBirth).getFullYear()
      : (student.admissionDate ? new Date(student.admissionDate).getFullYear() - 18 : 2003);

    let email = `${firstName}${lastName}${year}@gmail.com`;

    // Handle duplicates by appending a counter
    let counter = 2;
    while (usedEmails.has(email)) {
      email = `${firstName}${lastName}${year}${counter}@gmail.com`;
      counter++;
    }
    usedEmails.add(email);

    if (student.email !== email) {
      student.email = email;
      await student.save();
      console.log(`   ✔ ${student.name.padEnd(25)} → ${email}`);
      updated++;
    } else {
      console.log(`   ─ ${student.name.padEnd(25)} unchanged (${email})`);
    }
  }

  console.log(`\n✅ Updated ${updated} of ${students.length} student emails`);
  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
