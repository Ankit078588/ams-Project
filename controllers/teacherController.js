const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateUniqueTeacherId = require('../utils/generateTeacherId');



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
    const token = jwt.sign( { id: teacher._id, role: teacher.role }, process.env.JWT_SECRET );

    res.status(200).json({ token, msg: 'Login successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


module.exports = {
  registerTeacher,
  loginTeacher,
};
