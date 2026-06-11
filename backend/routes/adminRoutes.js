const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getUsers, createUser, updateUser, deleteUser,
  getCourses, createCourse, updateCourse, deleteCourse,
  getSubjects, getSubjectsByCourse, createSubject, updateSubject, deleteSubject,
  getNotices, createNotice, deleteNotice,
  getAllLeaves, respondToLeave, deleteLeave
} = require('../controllers/adminController');
router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.route('/users')
  .get(getUsers)
  .post(createUser);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);
router.route('/courses')
  .get(getCourses)
  .post(createCourse);
router.route('/courses/:id')
  .put(updateCourse)
  .delete(deleteCourse);
router.route('/subjects')
  .get(getSubjects)
  .post(createSubject);
router.get('/subjects/by-course/:courseId', getSubjectsByCourse);
router.route('/subjects/:id')
  .put(updateSubject)
  .delete(deleteSubject);
router.route('/notices')
  .get(getNotices)
  .post(createNotice);
router.route('/notices/:id')
  .delete(deleteNotice);
router.route('/leaves')
  .get(getAllLeaves);
router.route('/leaves/:id')
  .put(respondToLeave)
  .delete(deleteLeave);
module.exports = router;
