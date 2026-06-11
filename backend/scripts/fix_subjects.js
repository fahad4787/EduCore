const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

// Real-world subject names mapped by course keyword
const subjectsByCourse = {
  'B.Tech': [
    'Data Structures & Algorithms',
    'Object Oriented Programming',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
    'Machine Learning',
    'Web Technologies',
    'Compiler Design',
    'Theory of Computation',
  ],
  'B.Sc': [
    'Mathematics I',
    'Physics I',
    'Chemistry I',
    'Statistics & Probability',
    'Programming in C',
    'Discrete Mathematics',
    'Numerical Methods',
    'Linear Algebra',
    'Environmental Science',
    'Computer Applications',
  ],
  'M.Sc': [
    'Advanced Mathematics',
    'Research Methodology',
    'Quantum Physics',
    'Spectroscopy & Analytical Chemistry',
    'Bioinformatics',
    'Advanced Statistics',
    'Data Science & Analytics',
    'Machine Learning & AI',
    'Advanced Algorithms',
    'Scientific Computing',
  ],
  'B.Com': [
    'Financial Accounting',
    'Business Economics',
    'Corporate Law',
    'Income Tax Law & Practice',
    'Cost Accounting',
    'Business Statistics',
    'Auditing & Assurance',
    'Financial Management',
    'Marketing Management',
    'Business Communication',
  ],
  'MCA': [
    'Advanced Java Programming',
    'Software Engineering & Project Management',
    'Cloud Computing',
    'Artificial Intelligence',
    'Mobile Application Development',
    'Cyber Security',
    'Big Data Analytics',
    'DevOps & Agile Practices',
    'Internet of Things',
    'Blockchain Technology',
  ],
  'MBA': [
    'Business Strategy & Management',
    'Organizational Behaviour',
    'Financial Management',
    'Human Resource Management',
    'Marketing Management',
    'Operations Management',
    'Entrepreneurship & Innovation',
    'Business Analytics',
    'Supply Chain Management',
    'Corporate Governance & Ethics',
  ],
};

// Fallback for any course not matched above
const genericSubjects = [
  'Foundation of Computing',
  'Communication Skills',
  'Introduction to Programming',
  'Environmental Studies',
  'Professional Ethics',
];

const getSubjectsForCourse = (courseName) => {
  for (const key of Object.keys(subjectsByCourse)) {
    if (courseName.toUpperCase().includes(key.toUpperCase())) {
      return subjectsByCourse[key];
    }
  }
  return genericSubjects;
};

const fixSubjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/university_management');
    console.log('✅ Connected to Database\n');

    // Load all courses and professors
    const courses = await Course.find();
    const professors = await User.find({ role: 'Professor' });

    if (courses.length === 0) { console.log('❌ No courses found.'); process.exit(1); }
    if (professors.length === 0) { console.log('❌ No professors found.'); process.exit(1); }

    console.log(`📚 Found ${courses.length} courses`);
    console.log(`👨‍🏫 Found ${professors.length} professors\n`);

    // Delete all existing subjects
    await Subject.deleteMany({});
    console.log('🗑️  Cleared all old subjects\n');

    let profIndex = 0; // Round-robin professor assignment
    let totalCreated = 0;

    for (const course of courses) {
      const subjectNames = getSubjectsForCourse(course.name);
      console.log(`\n📖 Course: ${course.name}`);

      for (const subjectName of subjectNames) {
        const assignedProf = professors[profIndex % professors.length];
        profIndex++;

        const subject = new Subject({
          name: subjectName,
          course: course._id,
          professor: assignedProf._id,
        });

        await subject.save();
        console.log(`   ✔ "${subjectName}" → Prof. ${assignedProf.name}`);
        totalCreated++;
      }
    }

    // Update assignedCourses on professors based on their subject assignments
    console.log('\n🔗 Updating professor course assignments...');
    for (const prof of professors) {
      const subjects = await Subject.find({ professor: prof._id });
      const courseIds = [...new Set(subjects.map(s => s.course.toString()))];
      await User.findByIdAndUpdate(prof._id, { assignedCourses: courseIds });
      console.log(`   ✔ Prof. ${prof.name} → ${courseIds.length} course(s) assigned`);
    }

    console.log(`\n🎉 Done! Created ${totalCreated} subjects across ${courses.length} courses.`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

fixSubjects();
