/**
 * rebuild_users.js  v2
 * ─────────────────────────────────────────────────────────────
 * Enforces exactly:
 *   • 2 professors per course  (20 total — all old profs deleted)
 *   • 12 students  per course  (120 total)
 * Subjects are rebuilt and assigned to the new professors.
 * Admin accounts are NEVER touched.
 */
const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');
const User       = require('../models/User');
const Course     = require('../models/Course');
const Subject    = require('../models/Subject');
const Leave      = require('../models/Leave');
const Attendance = require('../models/Attendance');
require('dotenv').config();

// ── Name pools ──────────────────────────────────────────────
const maleFirst = ['Aarav','Arjun','Vikram','Rohit','Karan','Rahul','Amit','Suresh','Deepak','Manish','Ravi','Anil','Vinay','Sunil','Rajesh','Dinesh','Nikhil','Gaurav','Harsh','Ishaan','Jayesh','Kunal','Mohit','Neeraj','Omkar','Pratik','Rohan','Shubham','Tarun','Yash'];
const femaleFirst = ['Priya','Anjali','Pooja','Kavya','Neha','Divya','Shruti','Swati','Ritu','Aditi','Kirti','Megha','Jyoti','Shikha','Nisha','Deepika','Kajal','Monika','Sakshi','Aarti','Bhavna','Chitra','Ekta','Falak','Garima','Heena','Isha','Juhi','Komal','Lavanya'];
const lastNames  = ['Patel','Shah','Sharma','Verma','Singh','Gupta','Joshi','Mehta','Chauhan','Yadav','Kumar','Mishra','Pandey','Reddy','Rao','Nair','Desai','Iyer','Thakur','Agarwal','Bhatt','Das','Bose','Pillai','Malhotra','Saxena','Trivedi','Ahuja','Kapoor','Tiwari'];

// 2 professors per course — 20 hardcoded names for clean data
const profPairs = [
  ['Sanjay Mehta',    'Priya Sharma'],
  ['Arjun Desai',     'Kavya Iyer'],
  ['Rohit Verma',     'Anjali Nair'],
  ['Vikram Rao',      'Deepika Joshi'],
  ['Anil Gupta',      'Swati Patel'],
  ['Sunil Chauhan',   'Ritu Singh'],
  ['Manish Yadav',    'Neha Pandey'],
  ['Gaurav Mishra',   'Aditi Thakur'],
  ['Karan Agarwal',   'Shikha Reddy'],
  ['Rahul Kumar',     'Nisha Bhatt'],
];

// Real-world subjects per course type
const subjectsByCourse = {
  'MCA'   : ['Advanced Java Programming','Software Engineering & Project Management','Cloud Computing','Artificial Intelligence','Mobile Application Development','Cyber Security','Big Data Analytics','DevOps & Agile Practices','Internet of Things','Blockchain Technology'],
  'BCA'   : ['Programming Fundamentals','Data Structures','Web Development','Database Management Systems','Computer Networks','Operating Systems','Software Testing','Python Programming','Digital Electronics','Computer Graphics'],
  'BBA'   : ['Principles of Management','Business Economics','Financial Accounting','Marketing Management','Human Resource Management','Business Law','Entrepreneurship','Operations Management','Business Communication','Organizational Behaviour'],
  'MBA'   : ['Business Strategy & Management','Financial Management','Human Resource Management','Marketing Management','Operations Management','Entrepreneurship & Innovation','Business Analytics','Supply Chain Management','Corporate Governance & Ethics','Organizational Behaviour'],
  'B.TECH': ['Data Structures & Algorithms','Object Oriented Programming','Database Management Systems','Computer Networks','Operating Systems','Software Engineering','Machine Learning','Web Technologies','Compiler Design','Theory of Computation'],
  'M.TECH': ['Advanced Algorithms','Computer Vision','Natural Language Processing','Distributed Systems','High Performance Computing','Embedded Systems','VLSI Design','Robotics & Automation','Advanced Networking','Research Methodology'],
  'B.SC'  : ['Mathematics I','Physics I','Chemistry I','Statistics & Probability','Programming in C','Discrete Mathematics','Numerical Methods','Linear Algebra','Environmental Science','Computer Applications'],
  'M.SC'  : ['Advanced Mathematics','Research Methodology','Quantum Physics','Spectroscopy & Analytical Chemistry','Bioinformatics','Advanced Statistics','Data Science & Analytics','Machine Learning & AI','Advanced Algorithms','Scientific Computing'],
  'B.COM' : ['Financial Accounting','Business Economics','Corporate Law','Income Tax Law & Practice','Cost Accounting','Business Statistics','Auditing & Assurance','Financial Management','Marketing Management','Business Communication'],
  'M.COM' : ['Advanced Financial Accounting','Corporate Finance','Investment Analysis','International Business','Financial Markets & Institutions','Taxation Law','Management Accounting','Mergers & Acquisitions','Risk Management','Research Methods in Commerce'],
};
const genericSubjects = ['Foundation Studies','Research Methodology','Professional Ethics','Communication Skills','Environmental Studies','Introduction to Computing','Statistics','Economics','Sociology','Logic & Critical Thinking'];
const getSubjects = (name) => {
  const key = Object.keys(subjectsByCourse).find(k => name.toUpperCase().includes(k));
  return key ? subjectsByCourse[key] : genericSubjects;
};

const cities   = ['Ahmedabad','Surat','Vadodara','Rajkot','Gandhinagar','Bhavnagar','Jamnagar','Anand'];
const cats     = ['General','OBC','SC','ST'];
const parentFN = ['Rajesh','Suresh','Dinesh','Mukesh','Ramesh','Vijay','Sanjay','Amit'];
const rand     = (arr) => arr[Math.floor(Math.random() * arr.length)];
const phone    = () => rand(['9','8','7','6']) + Math.floor(Math.random() * 1e9).toString().padStart(9,'0');
const genDOB   = () => { const s=new Date(1998,0,1),e=new Date(2005,11,31); return new Date(s.getTime()+Math.random()*(e.getTime()-s.getTime())); };

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
  console.log('✅ Connected\n');

  const courses = await Course.find();
  if (!courses.length) { console.error('❌ No courses found'); process.exit(1); }

  const makePwd = async (name) => bcrypt.hash(`${name.trim().split(/\s+/)[0].toLowerCase()}123`, 10);
  const usedEmails = new Set((await User.find({role:'Admin'},'email')).map(u=>u.email));

  const makeEmail = (name, role, dob) => {
    const parts = name.trim().split(/\s+/);
    const first = parts[0].toLowerCase();
    const last  = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    let email;
    if (role === 'Student' && dob) {
      const year = new Date(dob).getFullYear();
      email = `${first}${last}${year}@gmail.com`;
    } else {
      email = `${first}.${last}@nexus.edu`;
    }
    let i = 2;
    while (usedEmails.has(email)) {
      email = role === 'Student' && dob
        ? `${first}${last}${new Date(dob).getFullYear()}${i}@gmail.com`
        : `${first}.${last}${i}@nexus.edu`;
      i++;
    }
    usedEmails.add(email);
    return email;
  };

  // ═══════════════════════════════════════════════════════
  //  1. DELETE all existing professors & their data
  // ═══════════════════════════════════════════════════════
  console.log('👨‍🏫 Rebuilding Professors (delete all → create 2 per course)...');
  const oldProfIds = await User.find({role:'Professor'}).distinct('_id');
  await User.deleteMany({ role: 'Professor' });
  console.log(`   🗑️  Deleted ${oldProfIds.length} old professors\n`);

  // ═══════════════════════════════════════════════════════
  //  2. CREATE exactly 2 professors per course
  // ═══════════════════════════════════════════════════════
  const courseProfMap = {}; // courseId → [profDoc, profDoc]

  for (let ci = 0; ci < courses.length; ci++) {
    const course = courses[ci];
    const pair   = profPairs[ci] || [`Prof A ${ci}`, `Prof B ${ci}`];
    const profs  = [];

    for (const name of pair) {
      const email = makeEmail(name, 'Professor', null);
      const prof  = await User.create({
        name, email,
        password       : await makePwd(name),
        role           : 'Professor',
        assignedCourses: [course._id],
        gender         : femaleFirst.some(f => name.startsWith(f)) ? 'Female' : 'Male',
        mobileNumber   : phone(),
      });
      profs.push(prof);
      console.log(`   [${course.name}] ✔ ${name}  (${email})`);
    }
    courseProfMap[course._id] = profs;
  }

  const totalProfs = await User.countDocuments({ role: 'Professor' });
  console.log(`\n   ✅ Total professors: ${totalProfs}\n`);

  // ═══════════════════════════════════════════════════════
  //  3. SUBJECTS — rebuild, assign alternately to 2 profs
  // ═══════════════════════════════════════════════════════
  console.log('📖 Rebuilding Subjects...');
  await Subject.deleteMany({});
  let totalSubjects = 0;

  for (const course of courses) {
    const profs    = courseProfMap[course._id];
    const subjects = getSubjects(course.name);
    for (let si = 0; si < subjects.length; si++) {
      await Subject.create({ name: subjects[si], course: course._id, professor: profs[si % 2]._id });
      totalSubjects++;
    }
    console.log(`   [${course.name}] ${subjects.length} subjects → ${profs.map(p=>p.name).join(' & ')}`);
  }
  console.log(`   ✅ ${totalSubjects} subjects created\n`);

  // ═══════════════════════════════════════════════════════
  //  4. STUDENTS — exactly 12 per course
  // ═══════════════════════════════════════════════════════
  console.log('🎓 Processing Students (12 per course)...');

  const allFirstNames = [
    ...maleFirst.map(n => [n,'Male']),
    ...femaleFirst.map(n => [n,'Female']),
  ];
  let nameIdx = 0;

  for (const course of courses) {
    // Sort by createdAt, keep oldest 12
    const existing = await User.find({ role:'Student', enrolledCourse: course._id }).sort({ createdAt: 1 });

    if (existing.length > 12) {
      const toDelete = existing.slice(12).map(s => s._id);
      await User.deleteMany({ _id: { $in: toDelete } });
      await Leave.deleteMany({ student: { $in: toDelete } });
      await Attendance.deleteMany({ student: { $in: toDelete } });
      console.log(`   [${course.name}] 🗑️  deleted ${toDelete.length} extras`);
    }

    let counter = await User.countDocuments({ role:'Student', enrolledCourse: course._id });
    const needed = 12 - counter;

    for (let i = 0; i < needed; i++) {
      const [firstName, gender] = allFirstNames[nameIdx % allFirstNames.length];
      const lastName = rand(lastNames);
      nameIdx++;

      const name  = `${firstName} ${lastName}`;
      const dobDate = genDOB();
      const email = makeEmail(name, 'Student', dobDate);

      counter++;
      const yr  = new Date().getFullYear().toString().slice(-2);
      const code = course.name.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().substring(0,5);
      const seq  = counter.toString().padStart(3,'0');

      await User.create({
        name, email,
        password        : await makePwd(name),
        role            : 'Student',
        enrolledCourse  : course._id,
        enrollmentNumber: `${yr}${code}${seq}`,
        gender,
        dateOfBirth     : dobDate,
        mobileNumber    : phone(),
        category        : rand(cats),
        address         : { city: rand(cities), state:'Gujarat', pincode:'38000'+Math.floor(Math.random()*9+1) },
        parentName      : `${rand(parentFN)} ${lastName}`,
        parentContact   : phone(),
        isHandicapped   : false,
        admissionDate   : new Date(),
      });
    }

    const final = await User.countDocuments({ role:'Student', enrolledCourse: course._id });
    console.log(`   [${course.name}] ✅ ${final}/12 students`);
  }

  // ── Summary ──────────────────────────────────────────────
  const totalStudents = await User.countDocuments({ role: 'Student' });
  const totalProfsFin = await User.countDocuments({ role: 'Professor' });
  console.log(`\n${'═'.repeat(52)}`);
  console.log(` Students  : ${totalStudents}   (target: ${courses.length * 12})`);
  console.log(` Professors: ${totalProfsFin}    (target: ${courses.length * 2})`);
  console.log(` Subjects  : ${totalSubjects}`);
  console.log(`${'═'.repeat(52)}`);
  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
