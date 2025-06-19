const express = require('express');
const router = express.Router();
const { isStudentMiddleware } = require('../middlewares/jwt');
const studentController = require('../controllers/studentController');


router.post('/register', studentController.registerStudent);
router.post('/login', studentController.loginStudent);

router.post('/join-new-classroom', isStudentMiddleware, studentController.joinClassroom);
router.post('/mark-attendance', isStudentMiddleware, studentController.markAttendance);
router.post('/join-community', isStudentMiddleware, studentController.joinCommunity);



module.exports = router;