const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');

const bcrypt = require('bcrypt');

const buildAttendanceTrend = (records, days = 14) => {
  const trend = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayRecords = records.filter(r => {
      const rd = new Date(r.date);
      rd.setHours(0, 0, 0, 0);
      return rd.getTime() === d.getTime();
    });
    const present = dayRecords.filter(r => r.status === 'Present').length;
    const total = dayRecords.length;
    trend.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      present,
      absent: total - present,
      rate: total > 0 ? Math.round((present / total) * 100) : null,
    });
  }
  return trend;
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalProfessors = await User.countDocuments({ role: 'Professor' });
    const totalCourses = await Course.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalNotices = await Notice.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const totalMaterials = await StudyMaterial.countDocuments();

    const courses = await Course.find();
    const students = await User.find({ role: 'Student' });
    const subjects = await Subject.find();
    const leaves = await Leave.find();
    const attendanceRecords = await Attendance.find();
    const recentNotices = await Notice.find()
      .sort('-createdAt')
      .limit(5)
      .populate('createdBy', 'name')
      .select('title audience createdAt createdBy');

    const courseMap = {};
    courses.forEach(c => { courseMap[c._id.toString()] = c.name; });

    const studentCountMap = {};
    students.forEach(s => {
      const courseId = s.enrolledCourse ? s.enrolledCourse.toString() : 'Unassigned';
      const courseName = courseMap[courseId] || 'Unassigned';
      studentCountMap[courseName] = (studentCountMap[courseName] || 0) + 1;
    });
    const studentDistribution = Object.keys(studentCountMap).map(name => ({
      name, value: studentCountMap[name]
    }));

    const subjectCountMap = {};
    subjects.forEach(s => {
      const courseId = s.course ? s.course.toString() : 'Unassigned';
      const courseName = courseMap[courseId] || 'Unassigned';
      subjectCountMap[courseName] = (subjectCountMap[courseName] || 0) + 1;
    });
    const subjectsPerCourse = Object.keys(subjectCountMap).map(name => ({
      name, count: subjectCountMap[name]
    }));

    const leaveStatusMap = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach(l => {
      if (leaveStatusMap[l.status] !== undefined) leaveStatusMap[l.status]++;
    });
    const leaveStatus = Object.keys(leaveStatusMap).map(name => ({
      name, value: leaveStatusMap[name]
    }));

    const presentTotal = attendanceRecords.filter(r => r.status === 'Present').length;
    const attendanceTotal = attendanceRecords.length;
    const attendanceRate = attendanceTotal > 0
      ? Math.round((presentTotal / attendanceTotal) * 100)
      : 0;

    const yearMap = {};
    students.forEach(s => {
      const yr = s.year || 'Unknown';
      yearMap[yr] = (yearMap[yr] || 0) + 1;
    });
    const enrollmentByYear = Object.entries(yearMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const attendanceTrend = buildAttendanceTrend(attendanceRecords);

    res.json({
      totalStudents,
      totalProfessors,
      totalCourses,
      totalSubjects,
      totalNotices,
      pendingLeaves,
      totalMaterials,
      attendanceRate,
      studentDistribution,
      subjectsPerCourse,
      leaveStatus,
      enrollmentByYear,
      attendanceTrend,
      recentNotices: recentNotices.map(n => ({
        title: n.title,
        audience: n.audience,
        createdAt: n.createdAt,
        author: n.createdBy?.name || 'Admin',
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUsers = async (req, res) => {
  try {
    const role = req.query.role;
    const query = role ? { role } : { role: { $ne: 'Admin' } };
    const users = await User.find(query).populate('enrolledCourse assignedCourses').select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createUser = async (req, res) => {
  try {
    const {
      name, email, password, role, enrolledCourse, assignedCourses,
      gender, dateOfBirth, mobileNumber, category, address, parentName, parentContact, isHandicapped
    } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let studentData = {};
    if (role === 'Student') {
      const course = await Course.findById(enrolledCourse);
      const admissionDate = new Date();
      const startYear = admissionDate.getFullYear();
      
      // Generate Sequential ID
      const yearPrefix = startYear.toString().slice(-2);
      let courseShort = 'UNK';
      if (course && course.name) {
        courseShort = course.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
      }
      const count = await User.countDocuments({ role: 'Student', enrolledCourse: enrolledCourse });
      const sequentialStr = (count + 1).toString().padStart(3, '0');
      const enrollmentNumber = `${yearPrefix}${courseShort}${sequentialStr}`;

      let durationYears = 1;
      if (course && course.duration) {
        const match = course.duration.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (course.duration.toLowerCase().includes('semester')) {
            durationYears = Math.ceil(num / 2);
          } else {
            durationYears = num;
          }
        }
      }
      const endYear = startYear + durationYears;
      const yearStr = `${startYear} - ${endYear}`;
      studentData = {
        enrolledCourse, enrollmentNumber, admissionDate, year: yearStr,
        gender, dateOfBirth, mobileNumber, category, address, parentName, parentContact, isHandicapped: isHandicapped === 'true' || isHandicapped === true
      };
    }
    const newUser = new User({
      name, email, password: hashedPassword, role,
      assignedCourses: role === 'Professor' ? assignedCourses : [],
      ...studentData
    });
    await newUser.save();
    if (role === 'Professor' && req.body.selectedSubjects?.length > 0) {
      await Subject.updateMany(
        { _id: { $in: req.body.selectedSubjects } },
        { professor: newUser._id }
      );
    }
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (user.role === 'Student') {
      if (req.body.enrolledCourse !== undefined) user.enrolledCourse = req.body.enrolledCourse;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth;
      if (req.body.mobileNumber !== undefined) user.mobileNumber = req.body.mobileNumber;
      if (req.body.category !== undefined) user.category = req.body.category;
      if (req.body.address !== undefined) user.address = req.body.address;
      if (req.body.parentName !== undefined) user.parentName = req.body.parentName;
      if (req.body.parentContact !== undefined) user.parentContact = req.body.parentContact;
      if (req.body.isHandicapped !== undefined) user.isHandicapped = req.body.isHandicapped === 'true' || req.body.isHandicapped === true;

      if (!user.enrollmentNumber) {
        const course = await Course.findById(user.enrolledCourse);
        const startYear = (user.admissionDate || new Date()).getFullYear();
        const yearPrefix = startYear.toString().slice(-2);
        let courseShort = 'UNK';
        if (course && course.name) {
          courseShort = course.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
        }
        const count = await User.countDocuments({ role: 'Student', enrolledCourse: user.enrolledCourse, enrollmentNumber: { $exists: true } });
        const sequentialStr = (count + 1).toString().padStart(3, '0');
        user.enrollmentNumber = `${yearPrefix}${courseShort}${sequentialStr}`;

        if (!user.admissionDate) {
          user.admissionDate = new Date();
        }
        if (!user.year) {
          let durationYears = 1;
          if (course && course.duration) {
            const match = course.duration.match(/(\d+)/);
            if (match) {
              const num = parseInt(match[1]);
              durationYears = course.duration.toLowerCase().includes('semester') ? Math.ceil(num / 2) : num;
            }
          }
          user.year = `${startYear} - ${startYear + durationYears}`;
        }
      }
    }
    if (user.role === 'Professor') {
      if (req.body.assignedCourses) user.assignedCourses = req.body.assignedCourses;
      // Sync subject assignments
      if (req.body.selectedSubjects !== undefined) {
        const courseId = (req.body.assignedCourses || user.assignedCourses)?.[0];
        if (courseId) {
          // Remove this professor from all subjects in the course
          await Subject.updateMany(
            { course: courseId, professor: user._id },
            { $unset: { professor: '' } }
          );
        }
        // Assign professor to selected subjects
        if (req.body.selectedSubjects.length > 0) {
          await Subject.updateMany(
            { _id: { $in: req.body.selectedSubjects } },
            { professor: user._id }
          );
        }
      }
    }
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('course').populate('professor', 'name email');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getSubjectsByCourse = async (req, res) => {
  try {
    const subjects = await Subject.find({ course: req.params.courseId })
      .populate('professor', 'name _id');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().populate('createdBy', 'name');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createNotice = async (req, res) => {
  try {
    const notice = new Notice({
      ...req.body,
      createdBy: req.user._id
    });
    const createdNotice = await notice.save();
    res.status(201).json(createdNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate({
      path: 'student',
      select: 'name email enrolledCourse',
      populate: { path: 'enrolledCourse', select: 'name' }
    });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const respondToLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (leave) {
      leave.status = status;
      leave.approvedBy = req.user._id;
      const updatedLeave = await leave.save();
      res.json(updatedLeave);
    } else {
      res.status(404).json({ message: 'Leave not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteLeave = async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getDashboardStats,
  getUsers, createUser, updateUser, deleteUser,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSubjects, getSubjectsByCourse, createSubject, updateSubject, deleteSubject,
  getNotices, createNotice, deleteNotice,
  getAllLeaves, respondToLeave, deleteLeave
};
