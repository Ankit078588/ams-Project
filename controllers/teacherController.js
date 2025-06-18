const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');
const Classroom = require('../models/classroom');
const { generateUniqueTeacherId } = require('../utils/generateTeacherId');
const { generateUniqueClassroomId } = require('../utils/generateClassroomId');



// Register Teacher
const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone ) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Teacher already exists' });
    }

    const teacher_id = await generateUniqueTeacherId();
    const newTeacher = new Teacher({
      name,
      email,
      password, 
      phone,
      teacher_id,
    });

    await newTeacher.save();
    res.status(201).json({ msg: 'Teacher registered successfully', teacher: newTeacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


// Login Teacher
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ msg: 'Both email & password are required' });
    }

    // find teacher
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ msg: 'Teacher not found' });

    // check password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    // generate token
    const token = jwt.sign( { id: teacher._id, teacher_id:teacher.teacher_id, role: teacher.role }, process.env.JWT_SECRET );

    res.status(200).json({ token, msg: 'Login successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


// Create new Classroom
const createClassroom = async (req, res) => {
  try {
    const { name } = req.body;
    const teacher_id = req.user?.teacher_id;            // middleware sets req.user
    if (!name || !teacher_id) {
      return res.status(400).json({ msg: 'Name and teacher ID are required' });
    }

    // create new classroom
    const classroom_id = await generateUniqueClassroomId();
    const classroom = new Classroom({
      name,
      classroom_id,
      teacher_id,
    });
    await classroom.save();

    // update teacher document with classroom reference
    await Teacher.findOneAndUpdate({ teacher_id }, { $push: { created_classrooms: classroom._id } } );

    res.status(201).json( {msg: 'Classroom created successfully', classroom} );
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


// Start Attendance
const startAttendance = async (req, res) => {
  const { latitude, longitude } = req.body;
  console.log('Latitude recieved: ', latitude);
  console.log('Longitude recieved: ', longitude);
  

  // if (!latitude || !longitude) {
  //     return res.status(400).send('Latitude and longitude are required.');
  // }

  // const attendanceSession = new Attendance({
  //     teacherId: req.user._id, // Assuming user is authenticated
  //     teacherLocation: { latitude, longitude },
  //     startTime: new Date(),
  // });

  // await attendanceSession.save();
  // res.redirect('/teacher/dashboard');
}


module.exports = {
  registerTeacher,
  loginTeacher,
  createClassroom,
  startAttendance
};
