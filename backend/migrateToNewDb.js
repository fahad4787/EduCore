const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const sourceUri = process.env.MONGO_URI;
const targetUri = 'mongodb://127.0.0.1:27017/UniversityManagementSystem';

if (!sourceUri) {
  console.error('Missing source MONGO_URI in .env');
  process.exit(1);
}

const copyCollections = async (sourceConn, targetConn) => {
  const collections = await sourceConn.db.listCollections().toArray();
  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;
    const sourceColl = sourceConn.db.collection(name);
    const targetColl = targetConn.db.collection(name);
    await targetColl.deleteMany({});
    const docs = await sourceColl.find({}).toArray();
    if (docs.length > 0) {
      await targetColl.insertMany(docs);
      console.log(`Copied ${docs.length} documents into ${name}`);
    } else {
      console.log(`Copied 0 documents into ${name}`);
    }
  }
};

const ensureKnownAccounts = async (targetConn) => {
  const usersColl = targetConn.db.collection('users');
  const coursesColl = targetConn.db.collection('courses');

  const defaultCourse = await coursesColl.findOne({ name: 'BCA' });
  const studentCourseId = defaultCourse?._id || null;
  const professorCourseIds = defaultCourse?._id ? [defaultCourse._id] : [];

  const knownUsers = [
    {
      name: 'System Admin',
      email: 'admin@university.com',
      password: 'admin123',
      role: 'Admin'
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'prof.priya@university.com',
      password: 'prof123',
      role: 'Professor',
      assignedCourses: professorCourseIds
    },
    {
      name: 'Yash Barai',
      email: 'yashbarai@gmail.com',
      password: 'yash123',
      role: 'Student',
      enrolledCourse: studentCourseId,
      enrollmentNumber: 'STU1001',
      gender: 'Male',
      year: '1st Year',
      category: 'General',
      admissionDate: new Date()
    }
  ];

  for (const userData of knownUsers) {
    const existing = await usersColl.findOne({ email: userData.email });
    if (existing) {
      console.log(`Credential already exists for ${userData.role}: ${userData.email}`);
      continue;
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userDoc = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
      assignedCourses: userData.assignedCourses || [],
      enrolledCourse: userData.enrolledCourse || null,
      enrollmentNumber: userData.enrollmentNumber,
      gender: userData.gender,
      year: userData.year,
      category: userData.category,
      admissionDate: userData.admissionDate
    };
    await usersColl.insertOne(userDoc);
    console.log(`Created ${userData.role} user: ${userData.email}`);
  }
};

const migrate = async () => {
  const sourceConn = await mongoose.createConnection(sourceUri).asPromise();
  const targetConn = await mongoose.createConnection(targetUri).asPromise();

  try {
    console.log(`Dropping target database at ${targetUri}`);
    await targetConn.db.dropDatabase();
    console.log('Target database dropped successfully');

    await copyCollections(sourceConn, targetConn);
    await ensureKnownAccounts(targetConn);

    console.log('\nMigration complete. New database created at:');
    console.log(targetUri);
    console.log('\nKnown credentials:');
    console.log('Admin: admin@university.com / admin123');
    console.log('Professor: prof.priya@university.com / prof123');
    console.log('Student: yashbarai@gmail.com / yash123');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 1;
  } finally {
    await sourceConn.close();
    await targetConn.close();
  }
};

migrate();
