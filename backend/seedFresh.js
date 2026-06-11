const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
dotenv.config();

const createHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const upsertCourse = async () => {
  let course = await Course.findOne({ name: 'BCA' });
  if (!course) {
    course = new Course({
      name: 'BCA',
      description: 'Bachelor of Computer Applications',
      duration: '3'
    });
    await course.save();
    console.log('Created course: BCA');
  }
  return course;
};

const upsertUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    console.log(`User already exists: ${userData.email}`);
    return existing;
  }
  const hashedPassword = await createHashedPassword(userData.password);
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  await user.save();
  console.log(`Created ${userData.role}: ${userData.email}`);
  return user;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const course = await upsertCourse();

    await upsertUser({
      name: 'System Admin',
      email: 'admin@university.com',
      password: 'admin123',
      role: 'Admin'
    });

    await upsertUser({
      name: 'Dr. Priya Sharma',
      email: 'prof.priya@university.com',
      password: 'prof123',
      role: 'Professor',
      assignedCourses: [course._id]
    });

    await upsertUser({
      name: 'Yash Barai',
      email: 'yashbarai@gmail.com',
      password: 'yash123',
      role: 'Student',
      enrolledCourse: course._id,
      enrollmentNumber: 'STU1001',
      gender: 'Male',
      year: '1st Year',
      category: 'General',
      admissionDate: new Date()
    });

    console.log('\nSeed complete. Use these credentials to log in:');
    console.log('Admin: admin@university.com / admin123');
    console.log('Professor: prof.priya@university.com / prof123');
    console.log('Student: yashbarai@gmail.com / yash123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
