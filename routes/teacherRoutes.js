const express = require('express');
const router = express.Router();
const { isTeacherMiddleware } = require('../middlewares/jwt');
const teacherController = require('../controllers/teacherController');


router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);

router.post('/create-new-classroom', isTeacherMiddleware, teacherController.createClassroom);
router.post('/start-attendance', isTeacherMiddleware, teacherController.startAttendance);
router.post('/end-attendance', isTeacherMiddleware, teacherController.endAttendance);


module.exports = router;