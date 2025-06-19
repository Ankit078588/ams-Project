const express = require('express');
const router = express.Router();
const { isTeacherMiddleware } = require('../middlewares/jwt');
const teacherController = require('../controllers/teacherController');
const upload = require('../utils/multer');


router.post('/register', teacherController.registerTeacher);
router.post('/login', teacherController.loginTeacher);

router.post('/create-new-classroom', isTeacherMiddleware, teacherController.createClassroom);
router.post('/start-attendance', isTeacherMiddleware, teacherController.startAttendance);
router.post('/end-attendance', isTeacherMiddleware, teacherController.endAttendance);

router.post('/create-new-post', isTeacherMiddleware, upload.single('file'), teacherController.createNewPost);
router.get('/teacher-posts/:teacherId', teacherController.getAllTeacherPosts);



module.exports = router;