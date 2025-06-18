const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');
const Classroom = require('../models/classroom');
const Attendance = require('../models/attendance');
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
  try {
    const { latitude, longitude, classroom_id } = req.body;
    const teacher_id = req.user.teacher_id;                   // From JWT middleware

    if (!latitude || !longitude || !classroom_id) {
      return res.status(400).json({ msg: 'Latitude, longitude, and classroom ID are required' });
    }
    console.log('Latitude recieved: ', latitude);
    console.log('Longitude recieved: ', longitude);

    // 1. Validate classroom
    const classroom = await Classroom.findOne({ classroom_id, teacher_id });
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found or not owned by this teacher' });
    }

    // 2. Check if attendance already started for today (optional but practical)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const alreadyStarted = await Attendance.findOne({
      classroom_id,
      teacher_id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (alreadyStarted) {
      return res.status(400).json({ msg: 'Attendance already started for today in this classroom.' });
    }

    // 3. Create attendance session
    const attendance = new Attendance({
      classroom_id,
      teacher_id,
      teacherLocation: { latitude, longitude },
      startTime: new Date(),
    });

    await attendance.save();

    return res.status(201).json({ msg: 'Attendance session started', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


// End Attendance
const endAttendance = async (req, res) => {
  try {
    const { classroom_id } = req.body;
    const teacher_id = req.user.teacher_id;           // Extracted from JWT middleware

    if (!classroom_id) {
      return res.status(400).json({ msg: 'Classroom ID is required' });
    }

    // 1. Find today's active attendance session
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendanceSession = await Attendance.findOne({
      classroom_id,
      teacher_id,
      date: { $gte: startOfDay, $lte: endOfDay },
      endTime: { $exists: false }
    });

    if (!attendanceSession) {
      return res.status(404).json({ msg: 'Active attendance session not found for today' });
    }

    // 2. Set endTime to now
    attendanceSession.endTime = new Date();
    await attendanceSession.save();

    return res.status(200).json({ msg: 'Attendance session ended', attendance: attendanceSession });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};




module.exports = {
  registerTeacher,
  loginTeacher,
  createClassroom,
  startAttendance,
  endAttendance
};
