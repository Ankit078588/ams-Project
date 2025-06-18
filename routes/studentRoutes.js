const express = require('express');
const router = express.Router();
const { isStudentMiddleware } = require('../middlewares/jwt');
const studentController = require('../controllers/studentController');


router.post('/register', studentController.registerStudent);
router.post('/login', studentController.loginStudent);

router.post('/join-new-classroom', isStudentMiddleware, studentController.joinClassroom);



module.exports = router;