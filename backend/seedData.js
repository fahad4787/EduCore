const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const User = require('./models/User');
const Course = require('./models/Course');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Notice = require('./models/Notice');
const StudyMaterial = require('./models/StudyMaterial');

dotenv.config();

const Names = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyaansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aaryan', 'Dhruv', 'Kabir', 'Ritik', 'Darsh',
  'Ahaan', 'Aakash', 'Jay', 'Meet', 'Varun', 'Neel', 'Yash', 'Rahul', 'Rohan', 'Amit', 'Sunil',
  'Sanjay', 'Kiran', 'Prakash', 'Rajesh', 'Suresh', 'Ramesh', 'Ravi', 'Anil', 'Nitin', 'Vijay',
  'Gaurav', 'Manish', 'Vikram', 'Praveen', 'Sandeep', 'Deepak', 'Tarun', 'Naveen', 'Ashish',
  'Pooja', 'Neha', 'Priya', 'Aditi', 'Anjali', 'Kavya', 'Sneha', 'Shruti', 'Swati', 'Megha',
  'Nisha', 'Aarti', 'Kirti', 'Ritu', 'Shikha', 'Jyoti', 'Divya', 'Deepika', 'Preeti', 'Priyanka'
];

const Surnames = [
  'Patel', 'Sharma', 'Singh', 'Kumar', 'Joshi', 'Desai', 'Mehta', 'Reddy', 'Rao', 'Gupta',
  'Trivedi', 'Shah', 'Agarwal', 'Mishra', 'Yadav', 'Das', 'Thakur', 'Chauhan', 'Verma', 'Goswami'
];

const courseSubjectsMap = {
  'BCA': ['C Programming', 'Data Structures', 'Database Management Systems', 'Web Development', 'Computer Networks'],
  'MCA': ['Advanced Java', 'Machine Learning', 'Artificial Intelligence', 'Cloud Computing', 'Data Science'],
  'BBA': ['Principles of Management', 'Financial Accounting', 'Marketing Management', 'Human Resource Management', 'Business Economics'],
  'MBA': ['Strategic Management', 'Corporate Finance', 'International Business', 'Operations Management', 'Organizational Behavior'],
  'B.Tech': ['Mechanics', 'Engineering Drawing', 'C Programming', 'Mathematics I', 'Physics'],
  'M.Tech': ['Advanced Algorithms', 'Distributed Systems', 'Cryptography', 'Machine Learning', 'Data Analytics'],
  'B.Sc': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  'M.Sc': ['Advanced Physics', 'Organic Chemistry', 'Advanced Calculus', 'Botany', 'Zoology'],
  'B.Com': ['Financial Accounting', 'Business Law', 'Economics', 'Cost Accounting', 'Taxation'],
  'M.Com': ['Corporate Tax Planning', 'Advanced Economics', 'Strategic Management', 'Advanced Accounting', 'Business Environment']
};

const getRandomName = () => Names[Math.floor(Math.random() * Names.length)];
const getRandomSurname = () => Surnames[Math.floor(Math.random() * Surnames.length)];
const getFullName = () => `${getRandomName()} ${getRandomSurname()}`;
const generateEnrollmentNumber = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();
const generatePhoneNumber = () => '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Clear all collections
    console.log('Clearing database collections...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Notice.deleteMany({});
    await StudyMaterial.deleteMany({});
    console.log('All existing data cleared.');

    const salt = await bcrypt.genSalt(10);

    // 2. Create System Admin
    const adminPassword = await bcrypt.hash('admin123', salt);
    const admin = new User({
      name: 'System Admin',
      email: 'admin@university.com',
      password: adminPassword,
      role: 'Admin'
    });
    await admin.save();
    console.log('Created Admin user: admin@university.com / admin123');

    // 3. Create all Courses
    const coursesData = [
      { name: 'BCA', duration: '3', desc: 'Bachelor of Computer Applications' },
      { name: 'MCA', duration: '2', desc: 'Master of Computer Applications' },
      { name: 'BBA', duration: '3', desc: 'Bachelor of Business Administrations' },
      { name: 'MBA', duration: '2', desc: 'Master of Business Administrations' },
      { name: 'B.Tech', duration: '4', desc: 'Bachelor of Technology' },
      { name: 'M.Tech', duration: '2', desc: 'Master of Technology' },
      { name: 'B.Sc', duration: '3', desc: 'Bachelor of Science' },
      { name: 'M.Sc', duration: '2', desc: 'Master of Science' },
      { name: 'B.Com', duration: '3', desc: 'Bachelor of Commerce' },
      { name: 'M.Com', duration: '2', desc: 'Master of Commerce' }
    ];

    const createdCourses = [];
    for (const c of coursesData) {
      const course = new Course({
        name: c.name,
        description: c.desc,
        duration: c.duration
      });
      await course.save();
      createdCourses.push(course);
      console.log(`Created Course: ${c.name}`);
    }

    // 4. Create 7 Professors and assign them courses
    // Distribute the 10 courses (indices 0 to 9) among 7 professors
    const profCourseMappings = [
      [0, 1], // Prof 0: BCA, MCA
      [2, 3], // Prof 1: BBA, MBA
      [4, 5], // Prof 2: B.Tech, M.Tech
      [6, 7], // Prof 3: B.Sc, M.Sc
      [8],    // Prof 4: B.Com
      [9],    // Prof 5: M.Com
      [0, 2]  // Prof 6: BCA, BBA (some overlapping support)
    ];

    const defaultProfPassword = await bcrypt.hash('prof123', salt);
    const createdProfessors = [];

    for (let i = 0; i < 7; i++) {
      const profName = getFullName();
      const emailPrefix = profName.split(' ')[0].toLowerCase();
      const profEmail = `prof.${emailPrefix}${i + 1}@university.com`;
      const assignedCourseIds = profCourseMappings[i].map(idx => createdCourses[idx]._id);

      const professor = new User({
        name: profName,
        email: profEmail,
        password: defaultProfPassword,
        role: 'Professor',
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        assignedCourses: assignedCourseIds
      });

      await professor.save();
      createdProfessors.push(professor);
      console.log(`Created Professor ${i + 1}: ${profName} (${profEmail}) - Assigned courses: ${profCourseMappings[i].map(idx => coursesData[idx].name).join(', ')}`);
    }

    // 5. Create Subjects and link them to Courses and Professors
    for (const course of createdCourses) {
      const subjectsToCreate = courseSubjectsMap[course.name] || [];
      // Find professors assigned to this course
      const courseProfs = createdProfessors.filter(prof =>
        prof.assignedCourses.some(cId => cId.equals(course._id))
      );

      for (let j = 0; j < subjectsToCreate.length; j++) {
        const subName = subjectsToCreate[j];
        // Assign to one of the course professors (round-robin)
        const assignedProf = courseProfs[j % courseProfs.length] || createdProfessors[0];

        const subject = new Subject({
          name: subName,
          course: course._id,
          professor: assignedProf._id
        });
        await subject.save();
        console.log(`Created Subject: "${subName}" for ${course.name} (taught by: ${assignedProf.name})`);
      }
    }

    // 6. Create exactly 50 Students (5 students per course)
    const defaultStudentPassword = await bcrypt.hash('student123', salt);
    const createdStudents = [];

    for (const course of createdCourses) {
      for (let i = 0; i < 5; i++) {
        const studentName = getFullName();
        const emailPrefix = studentName.replace(/\s+/g, '').toLowerCase();
        const randomDigits = Math.floor(Math.random() * 900) + 100;
        const studentEmail = `${emailPrefix}${randomDigits}@gmail.com`;

        // Years range based on course duration
        const durationYears = parseInt(course.duration) || 3;
        const yearsList = ['1st Year', '2nd Year', '3rd Year', '4th Year'].slice(0, durationYears);
        const selectedYear = yearsList[Math.floor(Math.random() * yearsList.length)];

        const student = new User({
          name: studentName,
          email: studentEmail,
          password: defaultStudentPassword,
          role: 'Student',
          enrolledCourse: course._id,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          enrollmentNumber: generateEnrollmentNumber(),
          mobileNumber: generatePhoneNumber(),
          category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
          year: selectedYear,
          admissionDate: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
        });

        await student.save();
        createdStudents.push(student);
      }
      console.log(`Added 5 students to course ${course.name}`);
    }
    console.log(`Successfully created exactly ${createdStudents.length} students.`);

    // 7. Add Attendance Records (last 10 days for each student, weekdays only)
    const today = new Date();
    let attendanceCount = 0;

    for (const student of createdStudents) {
      // Find professors for this student's course
      const courseProfs = createdProfessors.filter(prof =>
        prof.assignedCourses.some(cId => cId.equals(student.enrolledCourse))
      );
      const markingProf = courseProfs[Math.floor(Math.random() * courseProfs.length)] || createdProfessors[0];

      for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
        const attendanceDate = new Date();
        attendanceDate.setDate(today.getDate() - dayOffset);

        // Skip Saturday (6) and Sunday (0)
        const dayOfWeek = attendanceDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // 90% Present, 10% Absent
        const status = Math.random() > 0.1 ? 'Present' : 'Absent';

        const attendance = new Attendance({
          student: student._id,
          course: student.enrolledCourse,
          date: attendanceDate,
          status: status,
          markedBy: markingProf._id
        });

        await attendance.save();
        attendanceCount++;
      }
    }
    console.log(`Created ${attendanceCount} attendance records.`);

    // 8. Add Leave Requests (for 15 random students)
    const leaveReasons = [
      'Suffering from viral fever and advised bed rest',
      'Attending sister\'s wedding ceremony in hometown',
      'Urgent family emergency, need to travel out of town',
      'Dental surgery appointment',
      'Participating in inter-college sports tournament'
    ];
    const leaveStatuses = ['Pending', 'Approved', 'Rejected'];
    const shuffledStudents = [...createdStudents].sort(() => 0.5 - Math.random());
    const studentsForLeave = shuffledStudents.slice(0, 15);

    for (let i = 0; i < studentsForLeave.length; i++) {
      const student = studentsForLeave[i];
      const status = leaveStatuses[i % 3];

      const courseProfs = createdProfessors.filter(prof =>
        prof.assignedCourses.some(cId => cId.equals(student.enrolledCourse))
      );
      const approvingProf = courseProfs[Math.floor(Math.random() * courseProfs.length)] || createdProfessors[0];

      const leaveDate = new Date();
      leaveDate.setDate(today.getDate() + (Math.floor(Math.random() * 5) + 1));

      const leave = new Leave({
        student: student._id,
        date: leaveDate,
        reason: leaveReasons[Math.floor(Math.random() * leaveReasons.length)],
        status: status,
        approvedBy: status !== 'Pending' ? approvingProf._id : undefined
      });

      await leave.save();
      console.log(`Created Leave Request for ${student.name} - Status: ${status}`);
    }

    // 9. Add Notices
    const noticesData = [
      {
        title: 'Welcome to the New Academic Session 2026',
        content: 'We welcome all students and professors to the new academic session. Please ensure your registration and class schedules are up to date.',
        audience: 'All',
        creatorRole: 'Admin'
      },
      {
        title: 'End Semester Examinations Timetable',
        content: 'The end semester examination timetable has been published on the official portal. Students are advised to download and check the schedules.',
        audience: 'Student',
        creatorRole: 'Admin'
      },
      {
        title: 'Faculty Meeting: Academic Curriculum Review',
        content: 'A mandatory meeting for all faculty members will be held in the board room this Friday at 3:00 PM to review the academic curriculum.',
        audience: 'Professor',
        creatorRole: 'Admin'
      },
      {
        title: 'Submission Deadline Extension',
        content: 'The deadline for submitting the midterm assignments and project proposals has been extended to next Monday. Please submit to your respective professors.',
        audience: 'Student',
        creatorRole: 'Professor'
      },
      {
        title: 'Annual Tech Fest "TechStorm 2026"',
        content: 'Registrations are now open for the annual technical festival. Students can participate in various events like Coding, Web Design, and Robo-Wars.',
        audience: 'All',
        creatorRole: 'Professor'
      }
    ];

    for (const noticeData of noticesData) {
      let creatorId;
      if (noticeData.creatorRole === 'Admin') {
        creatorId = admin._id;
      } else {
        creatorId = createdProfessors[Math.floor(Math.random() * createdProfessors.length)]._id;
      }

      const notice = new Notice({
        title: noticeData.title,
        content: noticeData.content,
        audience: noticeData.audience,
        createdBy: creatorId
      });

      await notice.save();
      console.log(`Created Notice: "${noticeData.title}" for audience: ${noticeData.audience}`);
    }

    // 10. Add Study Materials (1 introductory material per course)
    for (const course of createdCourses) {
      const courseProfs = createdProfessors.filter(prof =>
        prof.assignedCourses.some(cId => cId.equals(course._id))
      );
      const uploadingProf = courseProfs[Math.floor(Math.random() * courseProfs.length)] || createdProfessors[0];

      const studyMaterial = new StudyMaterial({
        title: `${course.name} Introduction & Syllabus`,
        description: `Introductory guide and syllabus details for ${course.name}.`,
        fileUrl: `uploads/materials/${course.name.toLowerCase()}_intro.pdf`,
        course: course._id,
        uploadedBy: uploadingProf._id
      });
      await studyMaterial.save();
      console.log(`Created Study Material for ${course.name}`);
    }

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
