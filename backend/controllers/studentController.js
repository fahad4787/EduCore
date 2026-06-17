const User = require('../models/User');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const Course = require('../models/Course');

const buildStudentAttendanceTrend = (records, days = 14) => {
  const trend = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const match = records.find(r => {
      const rd = new Date(r.date);
      rd.setHours(0, 0, 0, 0);
      return rd.getTime() === d.getTime();
    });
    trend.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: match?.status || null,
      present: match?.status === 'Present' ? 1 : 0,
      absent: match?.status === 'Absent' ? 1 : 0,
    });
  }
  return trend;
};

const getDashboardStats = async (req, res) => {
  try {
    const courseId = req.user.enrolledCourse;
    const course = await Course.findById(courseId).select('name');

    const presentCount = await Attendance.countDocuments({ student: req.user._id, status: 'Present' });
    const totalAttendance = await Attendance.countDocuments({ student: req.user._id });
    const absentCount = totalAttendance - presentCount;
    const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;
    const noticesCount = await Notice.countDocuments({ audience: { $in: ['All', 'Student'] } });
    const studyMaterialsCount = await StudyMaterial.countDocuments({ course: courseId });

    const attendanceData = [
      { name: 'Present', value: presentCount },
      { name: 'Absent', value: absentCount },
    ].filter(d => d.value > 0);

    const leaves = await Leave.find({ student: req.user._id });
    const leaveMap = { Pending: 0, Approved: 0, Rejected: 0 };
    leaves.forEach(l => { leaveMap[l.status] = (leaveMap[l.status] || 0) + 1; });
    const leaveData = Object.entries(leaveMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    const subjects = await Subject.find({ course: courseId })
      .populate('professor', 'name')
      .select('name professor');
    const subjectList = subjects.map(s => ({
      name: s.name,
      professor: s.professor?.name || 'Unassigned',
    }));

    const attendanceRecords = await Attendance.find({ student: req.user._id })
      .sort('-date')
      .limit(30);
    const attendanceTrend = buildStudentAttendanceTrend(attendanceRecords);

    const recentAttendance = await Attendance.find({ student: req.user._id })
      .sort('-date')
      .limit(7)
      .select('date status');

    const recentNotices = await Notice.find({ audience: { $in: ['All', 'Student'] } })
      .sort('-createdAt')
      .limit(5)
      .populate('createdBy', 'name')
      .select('title content audience createdAt createdBy');

    const upcomingLeaves = await Leave.find({ student: req.user._id, date: { $gte: new Date() } })
      .sort('date')
      .limit(3)
      .select('date reason status');

    const presentStreak = (() => {
      const sorted = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
      let streak = 0;
      for (const rec of sorted) {
        if (rec.status === 'Present') streak++;
        else break;
      }
      return streak;
    })();

    res.json({
      attendancePercentage,
      noticesCount,
      studyMaterialsCount,
      subjectCount: subjectList.length,
      courseName: course?.name || '—',
      presentStreak,
      attendanceData,
      leaveData,
      subjectList,
      attendanceTrend,
      recentAttendance: recentAttendance.map(r => ({
        date: r.date,
        status: r.status,
      })),
      recentNotices: recentNotices.map(n => ({
        title: n.title,
        content: n.content,
        audience: n.audience,
        createdAt: n.createdAt,
        author: n.createdBy?.name || 'Admin',
      })),
      upcomingLeaves: upcomingLeaves.map(l => ({
        date: l.date,
        reason: l.reason,
        status: l.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.email) user.email = req.body.email;
    if (req.body.mobileNumber !== undefined) user.mobileNumber = req.body.mobileNumber;
    if (req.body.password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, enrolledCourse: user.enrolledCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ audience: { $in: ['All', 'Student'] } }).populate('createdBy', 'name');
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ student: req.user._id }).sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const applyLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;
    const leave = new Leave({
      student: req.user._id,
      date,
      reason
    });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAttendance = async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ student: req.user._id }).populate('course').populate('markedBy', 'name');
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find({ course: req.user.enrolledCourse }).populate('course');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getDashboardStats, updateProfile, getNotices,
  getLeaves, applyLeave, getAttendance, getStudyMaterials
};
