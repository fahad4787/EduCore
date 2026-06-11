/**
 * fix_subjects_v2.js
 * - Deletes all existing subjects
 * - Creates 5-7 subjects per course (random)
 * - Each subject assigned to exactly ONE professor
 * - The 2 professors of the course split the subjects between them
 */
const mongoose = require('mongoose');
const Subject  = require('../models/Subject');
const Course   = require('../models/Course');
const User     = require('../models/User');
require('dotenv').config();

// Real subject pools per course type (expanded so we can pick random 5-7)
const pools = {
  MCA   : ['Advanced Java Programming','Cloud Computing','Artificial Intelligence','Mobile Application Development','Cyber Security','Big Data Analytics','Blockchain Technology','DevOps & Agile Practices','Internet of Things','Software Engineering & Project Management'],
  BCA   : ['Programming Fundamentals','Data Structures','Web Development','Database Management Systems','Computer Networks','Operating Systems','Python Programming','Software Testing','Digital Electronics','Computer Graphics'],
  BBA   : ['Principles of Management','Business Economics','Financial Accounting','Marketing Management','Human Resource Management','Business Law','Entrepreneurship','Operations Management','Business Communication','Organizational Behaviour'],
  MBA   : ['Business Strategy & Management','Financial Management','Human Resource Management','Marketing Management','Operations Management','Business Analytics','Supply Chain Management','Corporate Governance & Ethics','Entrepreneurship & Innovation','Organizational Behaviour'],
  BTECH : ['Data Structures & Algorithms','Object Oriented Programming','Database Management Systems','Computer Networks','Operating Systems','Software Engineering','Machine Learning','Web Technologies','Compiler Design','Theory of Computation'],
  MTECH : ['Advanced Algorithms','Computer Vision','Natural Language Processing','Distributed Systems','High Performance Computing','Embedded Systems','VLSI Design','Robotics & Automation','Advanced Networking','Research Methodology'],
  BSC   : ['Mathematics I','Physics I','Chemistry I','Statistics & Probability','Programming in C','Discrete Mathematics','Numerical Methods','Linear Algebra','Environmental Science','Computer Applications'],
  MSC   : ['Advanced Mathematics','Research Methodology','Quantum Physics','Spectroscopy & Analytical Chemistry','Bioinformatics','Advanced Statistics','Data Science & Analytics','Machine Learning & AI','Advanced Algorithms','Scientific Computing'],
  BCOM  : ['Financial Accounting','Business Economics','Corporate Law','Income Tax Law & Practice','Cost Accounting','Business Statistics','Auditing & Assurance','Financial Management','Marketing Management','Business Communication'],
  MCOM  : ['Advanced Financial Accounting','Corporate Finance','Investment Analysis','International Business','Financial Markets & Institutions','Taxation Law','Management Accounting','Mergers & Acquisitions','Risk Management','Research Methods in Commerce'],
};
const generic = ['Foundation Studies','Research Methodology','Professional Ethics','Communication Skills','Environmental Studies','Introduction to Computing','Statistics','Economics','Sociology','Logic & Critical Thinking'];

const getPool = (name) => {
  const key = Object.keys(pools).find(k => name.toUpperCase().replace(/[^A-Z]/g,'').includes(k));
  return key ? pools[key] : generic;
};

const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
  console.log('✅ Connected\n');

  const courses = await Course.find();
  if (!courses.length) { console.error('❌ No courses found'); process.exit(1); }

  // Delete ALL existing subjects
  await Subject.deleteMany({});
  console.log('🗑️  Cleared all old subjects\n');

  let totalCreated = 0;

  for (const course of courses) {
    // Get professors assigned to this course
    const profs = await User.find({ role: 'Professor', assignedCourses: course._id });
    if (!profs.length) {
      console.log(`   [${course.name}] ⚠️  No professors found — skipping`);
      continue;
    }

    // Pick random 5-7 subjects from the pool
    const pool    = getPool(course.name);
    const count   = randInt(5, 7);
    const picked  = shuffle(pool).slice(0, count);

    console.log(`📖 [${course.name}] — ${count} subjects, ${profs.length} professor(s)`);

    for (let i = 0; i < picked.length; i++) {
      // Assign alternately between available professors (one per subject)
      const prof = profs[i % profs.length];
      await Subject.create({ name: picked[i], course: course._id, professor: prof._id });
      console.log(`   ✔ "${picked[i]}"  →  Prof. ${prof.name}`);
      totalCreated++;
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(` ✅ Total subjects created: ${totalCreated}`);
  console.log(` Across ${courses.length} courses (5–7 each)`);
  console.log(`${'═'.repeat(50)}\n`);
  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
