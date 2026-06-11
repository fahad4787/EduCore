const express = require('express');
const router = express.Router();
const { protect, professorOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getDashboardStats, getMyStudents, getNotices,
  getStudentLeaves, respondToLeave, addAttendance,
  uploadStudyMaterial, getStudyMaterials, deleteStudyMaterial, getMyAssignedCourses, updateProfile
} = require('../controllers/professorController');
router.use(protect, professorOnly);
router.get('/dashboard', getDashboardStats);
router.put('/profile', updateProfile);
router.get('/students', getMyStudents);
router.get('/notices', getNotices);
router.get('/courses', getMyAssignedCourses);
router.route('/leaves')
  .get(getStudentLeaves);
router.put('/leaves/:id', respondToLeave);
router.post('/attendance', addAttendance);
router.route('/studymaterial')
  .get(getStudyMaterials)
  .post(upload.single('file'), uploadStudyMaterial);
router.delete('/studymaterial/:id', deleteStudyMaterial);
module.exports = router;
