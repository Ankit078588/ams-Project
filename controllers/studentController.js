const Classroom = require('../models/classroom');
const Student = require('../models/student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUniqueStudentId } = require('../utils/generateStudentId');


// Register Student
const registerStudent = async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
  
      if (!name || !email || !password || !phone ) {
        return res.status(400).json({ msg: 'All fields are required' });
      }
  
      const existing = await Student.findOne({ email });
      if (existing) {
        return res.status(400).json({ msg: 'Student already exists' });
      }
      
      const student_id = await generateUniqueStudentId();
      const newStudent = new Student({
        name,
        email,
        password, 
        phone,
        student_id,
      });
  
      await newStudent.save();
      res.status(201).json({ msg: 'Student registered successfully', student: newStudent });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};
  
  
// Login Student
const loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ msg: 'Both email & password are required' });
        }
    
        // find Student
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ msg: 'Student not found' });
    
        // check password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });
    
        // generate token
        const token = jwt.sign( { id: student._id, student_id:student.student_id, role: student.role }, process.env.JWT_SECRET );
    
        res.status(200).json({ token, msg: 'Login successful' });
    } catch (err) {
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};


// Join Classroom
const joinClassroom = async (req, res) => {
  try {
    const { classroom_id } = req.body;
    const studentId = req.user.id;      // using middleware to decode JWT

    if (!classroom_id) {
      return res.status(400).json({ msg: 'Classroom ID is required' });
    }

    // 1. Find classroom by classroom_id
    const classroom = await Classroom.findOne({ classroom_id });
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    // 2. Check if student already joined
    if (classroom.students.includes(studentId)) {
      return res.status(400).json({ msg: 'You have already joined this classroom' });
    }

    // 3. Update Classroom (push student)
    classroom.students.push(studentId);
    await classroom.save();

    // 4. Update Student (push classroom)
    const student = await Student.findById(studentId);
    student.joined_classrooms.push(classroom._id);
    await student.save();

    return res.status(200).json({ msg: 'Joined classroom successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};



module.exports = {
  registerStudent,
  loginStudent,
  joinClassroom
}
