const User = require('../models/User');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const StudyMaterial = require('../models/StudyMaterial');

const EDUCORE_MODULES = `
EduCore is a university management platform with these modules:
- Authentication: JWT login for Admin, Professor, Student roles
- Admin: manage students, professors, courses, subjects, notices, leave approvals, profile
- Professor: view assigned students, mark attendance, upload study materials, approve leaves, view notices, profile
- Student: view attendance, study materials, apply for leave, view notices, view enrolled subjects, profile
- Courses: degree programs students enroll in
- Subjects: courses taught within a program, assigned to professors
- Attendance: Present/Absent records per student per course per date
- Leaves: students/professors apply; admin/professors approve or reject (Pending/Approved/Rejected)
- Notices: announcements with audience All, Admin, Professor, or Student
- Study Materials: files uploaded by professors for their courses
`;

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const buildAdminContext = async () => {
  const [totalStudents, totalProfessors, totalCourses, courses, subjects, notices, leaves, students] = await Promise.all([
    User.countDocuments({ role: 'Student' }),
    User.countDocuments({ role: 'Professor' }),
    Course.countDocuments(),
    Course.find().select('name duration').limit(8).lean(),
    Subject.find().populate('course', 'name').populate('professor', 'name').limit(10).lean(),
    Notice.find().sort('-createdAt').limit(5).populate('createdBy', 'name').lean(),
    Leave.find().sort('-createdAt').limit(8).populate('student', 'name email').lean(),
    User.find({ role: 'Student' }).populate('enrolledCourse', 'name').select('name email enrollmentNumber enrolledCourse').limit(10).lean(),
  ]);

  const leaveStats = { Pending: 0, Approved: 0, Rejected: 0 };
  const allLeaves = await Leave.find();
  allLeaves.forEach((l) => { if (leaveStats[l.status] !== undefined) leaveStats[l.status]++; });

  return {
    role: 'Admin',
    stats: { totalStudents, totalProfessors, totalCourses, leaveStats },
    courses: courses.map((c) => ({ name: c.name, duration: c.duration })),
    subjects: subjects.map((s) => ({
      name: s.name,
      course: s.course?.name,
      professor: s.professor?.name || 'Unassigned',
    })),
    recentNotices: notices.map((n) => ({
      title: n.title,
      audience: n.audience,
      by: n.createdBy?.name,
      date: formatDate(n.createdAt),
    })),
    recentLeaves: leaves.map((l) => ({
      student: l.student?.name,
      date: formatDate(l.date),
      status: l.status,
      reason: (l.reason || '').slice(0, 80),
    })),
    studentSample: students.map((s) => ({
      name: s.name,
      email: s.email,
      enrollment: s.enrollmentNumber,
      course: s.enrolledCourse?.name || 'Unassigned',
    })),
  };
};

const buildProfessorContext = async (user) => {
  const fullUser = await User.findById(user._id).populate('assignedCourses', 'name description').lean();
  const assignedIds = fullUser.assignedCourses?.map((c) => c._id) || [];

  const [students, notices, leaves, materials, subjects] = await Promise.all([
    User.find({ role: 'Student', enrolledCourse: { $in: assignedIds } })
      .populate('enrolledCourse', 'name')
      .select('name email enrollmentNumber enrolledCourse')
      .limit(15)
      .lean(),
    Notice.find({ audience: { $in: ['All', 'Professor'] } }).sort('-createdAt').limit(5).lean(),
    Leave.find({ student: { $in: await User.find({ enrolledCourse: { $in: assignedIds } }).distinct('_id') } })
      .sort('-createdAt').limit(6).populate('student', 'name').lean(),
    StudyMaterial.find({ uploadedBy: user._id }).populate('course', 'name').limit(8).lean(),
    Subject.find({ professor: user._id }).populate('course', 'name').lean(),
  ]);

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');

  const attendanceSummary = [];
  for (const student of students.slice(0, 8)) {
    const total = await Attendance.countDocuments({ student: student._id });
    const present = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    if (total > 0) {
      attendanceSummary.push({
        student: student.name,
        present,
        total,
        percentage: ((present / total) * 100).toFixed(1),
      });
    }
  }

  return {
    role: 'Professor',
    profile: {
      name: fullUser.name,
      email: fullUser.email,
      assignedCourses: fullUser.assignedCourses?.map((c) => c.name) || [],
    },
    stats: {
      studentsCount: students.length,
      pendingLeaves: pendingLeaves.length,
      materialsUploaded: materials.length,
      subjectsTeaching: subjects.length,
    },
    students: students.map((s) => ({
      name: s.name,
      email: s.email,
      enrollment: s.enrollmentNumber,
      course: s.enrolledCourse?.name,
    })),
    subjectsTeaching: subjects.map((s) => ({ name: s.name, course: s.course?.name })),
    studyMaterials: materials.map((m) => ({ title: m.title, course: m.course?.name })),
    pendingLeaves: pendingLeaves.map((l) => ({
      student: l.student?.name,
      date: formatDate(l.date),
      reason: (l.reason || '').slice(0, 80),
    })),
    recentNotices: notices.map((n) => ({ title: n.title, audience: n.audience, date: formatDate(n.createdAt) })),
    attendanceSummary,
  };
};

const buildStudentContext = async (user) => {
  const fullUser = await User.findById(user._id).populate('enrolledCourse', 'name description duration').lean();
  const courseId = fullUser.enrolledCourse?._id;

  const [attendance, leaves, notices, materials, subjects] = await Promise.all([
    Attendance.find({ student: user._id }).sort('-date').limit(10).populate('course', 'name').lean(),
    Leave.find({ student: user._id }).sort('-createdAt').limit(6).lean(),
    Notice.find({ audience: { $in: ['All', 'Student'] } }).sort('-createdAt').limit(5).lean(),
    StudyMaterial.find({ course: courseId }).populate('uploadedBy', 'name').limit(8).lean(),
    Subject.find({ course: courseId }).populate('professor', 'name').lean(),
  ]);

  const present = attendance.filter((a) => a.status === 'Present').length;
  const total = attendance.length;
  const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return {
    role: 'Student',
    profile: {
      name: fullUser.name,
      email: fullUser.email,
      enrollmentNumber: fullUser.enrollmentNumber,
      course: fullUser.enrolledCourse?.name,
      courseDescription: fullUser.enrolledCourse?.description,
      gender: fullUser.gender,
      category: fullUser.category,
      year: fullUser.year,
      mobile: fullUser.mobileNumber,
    },
    stats: {
      attendancePercentage,
      presentDays: present,
      absentDays: total - present,
      totalLeaveRequests: leaves.length,
      pendingLeaves: leaves.filter((l) => l.status === 'Pending').length,
      studyMaterialsCount: materials.length,
      noticesCount: notices.length,
    },
    subjects: subjects.map((s) => ({ name: s.name, professor: s.professor?.name || 'Unassigned' })),
    studyMaterials: materials.map((m) => ({ title: m.title, uploadedBy: m.uploadedBy?.name })),
    leaves: leaves.map((l) => ({
      date: formatDate(l.date),
      reason: (l.reason || '').slice(0, 80),
      status: l.status,
    })),
    recentAttendance: attendance.slice(0, 6).map((a) => ({
      date: formatDate(a.date),
      status: a.status,
      course: a.course?.name,
    })),
    recentNotices: notices.map((n) => ({
      title: n.title,
      content: n.content?.slice(0, 80),
      date: formatDate(n.createdAt),
    })),
  };
};

const buildContextForUser = async (user) => {
  let data;
  if (user.role === 'Admin') {
    data = await buildAdminContext();
  } else if (user.role === 'Professor') {
    data = await buildProfessorContext(user);
  } else {
    data = await buildStudentContext(user);
  }

  return `${EDUCORE_MODULES}

CURRENT USER ROLE: ${user.role}
USER NAME: ${user.name}

LIVE DATA FROM DATABASE (use this to answer accurately):
${JSON.stringify(data)}`;
};

module.exports = { buildContextForUser, EDUCORE_MODULES };
