/**
 * fix_unique_professors.js
 * ─────────────────────────────────────────────────
 * Ensures each subject has exactly ONE unique professor.
 * Rules:
 *  1. If a professor currently teaches > 1 subject → keep their FIRST subject,
 *     unassign them from the rest.
 *  2. For every subject with no professor → create a brand-new professor.
 *  3. New professor gets assignedCourses = [subject.course]
 *  4. Password = firstname123, email = firstname.lastname@nexus.edu
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const Subject  = require('../models/Subject');
const Course   = require('../models/Course');
require('dotenv').config();

// ── Name pool for new professors ──────────────────
const maleFirst   = ['Aditya','Ankit','Arvind','Ashok','Bharat','Chirag','Dev','Dilip','Gopal','Harish','Hemant','Jagdish','Jayesh','Jitendra','Kamal','Lalit','Mahesh','Narendra','Nilesh','Paresh','Pramod','Puneet','Rajiv','Rakesh','Ramesh','Sachin','Sameer','Satish','Saurabh','Shailesh','Shankar','Shivam','Tushar','Umesh','Vipul','Yogesh','Abhishek','Akash','Amol','Atul'];
const femaleFirst = ['Alka','Amita','Anita','Archana','Asha','Bhavna','Charu','Deepa','Garima','Heena','Hema','Jyotsna','Kavita','Latika','Madhu','Mamta','Meera','Mira','Namita','Nandita','Neelam','Padma','Payal','Pushpa','Rekha','Renuka','Savita','Seema','Smita','Sonal','Sunita','Usha','Vandana','Varsha','Vidya','Vineeta','Yogita','Zarina','Anupama','Chetna'];
const lastNames   = ['Acharya','Awasthi','Bajpai','Banerjee','Bhatia','Bose','Chakraborty','Chatterjee','Chaudhary','Chavan','Deshpande','Dubey','Dutta','Goyal','Jain','Khatri','Kulkarni','Lal','Mukherjee','Nanda','Pawar','Pillai','Prasad','Rawal','Roy','Sen','Shukla','Soni','Srivastava','Subramaniam','Tiwari','Upadhyay','Vaidya','Wagh','Yadav'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
  console.log('✅ Connected\n');

  // ── 1. Load all subjects with professor ───────────
  const subjects = await Subject.find().populate('professor', '_id name').populate('course');
  console.log(`📚 Total subjects: ${subjects.length}\n`);

  // ── 2. Group by professor → keep first, unassign rest ──
  const profSubjectMap = {}; // profId → [subjectIds]

  for (const sub of subjects) {
    if (!sub.professor) continue;
    const pid = sub.professor._id.toString();
    if (!profSubjectMap[pid]) profSubjectMap[pid] = [];
    profSubjectMap[pid].push(sub._id.toString());
  }

  let unassignedCount = 0;
  for (const [profId, subIds] of Object.entries(profSubjectMap)) {
    if (subIds.length <= 1) continue; // already unique
    // Unset professor from all but the first
    const toUnset = subIds.slice(1);
    await Subject.updateMany(
      { _id: { $in: toUnset } },
      { $unset: { professor: '' } }
    );
    console.log(`   🔓 Prof ${profId} had ${subIds.length} subjects → kept 1, freed ${toUnset.length}`);
    unassignedCount += toUnset.length;
  }
  console.log(`\n   ${unassignedCount} subjects now unassigned\n`);

  // ── 3. Reload subjects without professor ──────────
  const unassigned = await Subject.find({ professor: { $exists: false } }).populate('course');
  const alsoNull   = await Subject.find({ professor: null }).populate('course');
  const needProf   = [...unassigned, ...alsoNull];

  // De-duplicate by _id
  const seen = new Set();
  const toFill = needProf.filter(s => {
    if (seen.has(s._id.toString())) return false;
    seen.add(s._id.toString());
    return true;
  });

  console.log(`👨‍🏫 Creating ${toFill.length} new professors...\n`);

  // Track used emails
  const usedEmails = new Set(
    (await User.find({}, 'email')).map(u => u.email.toLowerCase())
  );

  const makeEmail = (first, last) => {
    let email = `${first.toLowerCase()}.${last.toLowerCase()}@nexus.edu`;
    let i = 2;
    while (usedEmails.has(email)) {
      email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@nexus.edu`;
      i++;
    }
    usedEmails.add(email);
    return email;
  };

  let created = 0;
  const isFemaleSubject = (name) => {
    const femaleKeywords = ['nutrition','nursing','home','language','art','literature','child','women','textile'];
    return femaleKeywords.some(k => name.toLowerCase().includes(k));
  };

  for (const subject of toFill) {
    const isFemale = isFemaleSubject(subject.name) || Math.random() < 0.45;
    const firstName = isFemale ? rand(femaleFirst) : rand(maleFirst);
    const lastName  = rand(lastNames);
    const name      = `${firstName} ${lastName}`;
    const email     = makeEmail(firstName, lastName);
    const password  = await bcrypt.hash(`${firstName.toLowerCase()}123`, 10);

    const prof = await User.create({
      name, email, password,
      role           : 'Professor',
      gender         : isFemale ? 'Female' : 'Male',
      assignedCourses: subject.course ? [subject.course._id] : [],
      mobileNumber   : '9' + Math.floor(Math.random() * 1e9).toString().padStart(9, '0'),
    });

    await Subject.findByIdAndUpdate(subject._id, { professor: prof._id });

    console.log(`   ✔ [${(subject.course?.name || '?').padEnd(8)}] "${subject.name}"`);
    console.log(`        → Prof. ${name}  (${email})`);
    created++;
  }

  // ── 4. Summary ────────────────────────────────────
  const totalProfs    = await User.countDocuments({ role: 'Professor' });
  const totalSubjects = await Subject.countDocuments();
  const assigned      = await Subject.countDocuments({ professor: { $ne: null } });

  console.log(`\n${'═'.repeat(55)}`);
  console.log(` ✅ New professors created : ${created}`);
  console.log(` 👨‍🏫 Total professors now   : ${totalProfs}`);
  console.log(` 📚 Subjects assigned      : ${assigned}/${totalSubjects}`);
  console.log(` 🔑 Passwords: firstname123 (lowercase)`);
  console.log(`${'═'.repeat(55)}\n`);

  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
