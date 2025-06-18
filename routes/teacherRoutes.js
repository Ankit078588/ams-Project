const express = require('express');
const router = express.Router();
const { isTeacherMiddleware } = require('../middlewares/jwt');
const teacherController = require('../controllers/teacherController');


router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);

router.post('/create-new-classroom', isTeacherMiddleware, teacherController.createClassroom);
router.post('/teacher/start-attendance', isTeacherMiddleware, teacherController.startAttendance);


module.exports = router;