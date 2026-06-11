const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
require('dotenv').config();

const migrateStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university');
    console.log('Connected to Database');

    const students = await User.find({ role: 'Student' });
    console.log(`Found ${students.length} students. Starting migration...`);

    const courseCounters = {};

    for (const student of students) {
      let needsUpdate = false;

      // 1. Generate Enrollment Number if missing or not matching format
      if (!student.enrollmentNumber || student.enrollmentNumber.length > 10 || !student.enrollmentNumber.match(/^[0-9]{2}[A-Z]+[0-9]{3}$/)) {
        if (student.enrolledCourse) {
          const course = await Course.findById(student.enrolledCourse);
          if (course) {
            const courseIdStr = course._id.toString();
            if (courseCounters[courseIdStr] === undefined) {
              // Get current count of students with valid format
              courseCounters[courseIdStr] = 0;
            }
            
            courseCounters[courseIdStr]++;
            
            const startYear = (student.admissionDate || student.createdAt || new Date()).getFullYear();
            const yearPrefix = startYear.toString().slice(-2);
            let courseShort = course.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
            const sequentialStr = courseCounters[courseIdStr].toString().padStart(3, '0');
            
            student.enrollmentNumber = `${yearPrefix}${courseShort}${sequentialStr}`;
            needsUpdate = true;
            console.log(`Assigned ID: ${student.enrollmentNumber} to ${student.name}`);
          }
        }
      }

      // 2. Add dummy data for new personal details if missing or bad
      if (!student.dateOfBirth) {
        const start = new Date(1998, 0, 1);
        const end = new Date(2005, 11, 31);
        student.dateOfBirth = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        needsUpdate = true;
      }
      
      const femaleNames = ['pooja', 'shruti', 'anjali', 'deepika', 'jyoti', 'kavya', 'priya', 'shikha', 'megha', 'ritu', 'aditi', 'kirti', 'swati', 'neha', 'divya'];
      const firstName = student.name.split(' ')[0].toLowerCase();
      const lastName = student.name.split(' ').length > 1 ? student.name.split(' ').pop() : 'Patel';
      
      if (femaleNames.includes(firstName)) {
        student.gender = 'Female';
      } else {
        student.gender = 'Male';
      }
      needsUpdate = true;

      const genPhone = () => {
        const prefixes = ['9', '8', '7', '6'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
      };

      student.mobileNumber = genPhone();
      needsUpdate = true;

      if (!student.category) {
        const cats = ['General', 'OBC', 'SC', 'ST'];
        student.category = cats[Math.floor(Math.random() * cats.length)];
        needsUpdate = true;
      }
      
      const gujaratCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar'];
      student.address = {
        city: gujaratCities[Math.floor(Math.random() * gujaratCities.length)],
        state: 'Gujarat',
        pincode: '38000' + Math.floor(Math.random() * 9 + 1)
      };
      needsUpdate = true;

      const parentNames = ['Rajesh', 'Suresh', 'Dinesh', 'Mukesh', 'Ramesh', 'Vijay', 'Sanjay', 'Amit', 'Sunil', 'Praveen'];
      const randomParentFirstName = parentNames[Math.floor(Math.random() * parentNames.length)];
      student.parentName = randomParentFirstName + ' ' + lastName;
      needsUpdate = true;
      
      student.parentContact = genPhone();
      needsUpdate = true;
      
      if (student.isHandicapped === undefined) {
        student.isHandicapped = false;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await student.save();
      }
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateStudents();
