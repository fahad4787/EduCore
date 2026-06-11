const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats, updateProfile, getNotices,
  getLeaves, applyLeave, getAttendance, getStudyMaterials
} = require('../controllers/studentController');
router.use(protect);
const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Student') next();
  else res.status(403).json({ message: 'Not authorized as a student' });
};
router.use(studentOnly);
router.get('/dashboard', getDashboardStats);
router.put('/profile', updateProfile);
router.get('/notices', getNotices);
router.route('/leaves')
  .get(getLeaves)
  .post(applyLeave);
router.get('/attendance', getAttendance);
router.get('/studymaterial', getStudyMaterials);
module.exports = router;
