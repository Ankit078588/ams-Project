const Attendance = require('../models/attendance');
const Classroom = require('../models/classroom');
const Student = require('../models/student');
const Community = require('../models/community');
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


// Haversine formula to calculate distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3; // Earth radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in meters
};


// Mark Attendance
const markAttendance = async (req, res) => {
  try {
    const { classroom_id, latitude, longitude } = req.body;
    const student_id = req.user.student_id;
    const studentMongoId = req.user.id;

    if (!classroom_id || !latitude || !longitude) {
      return res.status(400).json({ msg: 'Classroom ID and student location required' });
    }

    // 1. Find classroom
    const classroom = await Classroom.findOne({ classroom_id });
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    // 2. Check if student joined classroom
    const isStudentInClass = classroom.students.includes(studentMongoId);
    if (!isStudentInClass) {
      return res.status(403).json({ msg: 'You have not joined this classroom' });
    }

    // 3. Find active attendance session (today)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const attendanceSession = await Attendance.findOne({
      classroom_id,
      date: { $gte: startOfDay, $lte: endOfDay },
      endTime: { $exists: false },
    });

    if (!attendanceSession) {
      return res.status(404).json({ msg: 'No active attendance session for today' });
    }

    // 4. Check if student already marked
    const alreadyMarked = attendanceSession.present_students.some(
      (s) => s.student_id === student_id
    );
    if (alreadyMarked) {
      return res.status(400).json({ msg: 'You have already marked attendance' });
    }

    // 5. Calculate distance between student and teacher
    const teacherLocation = attendanceSession.teacherLocation;
    if (!teacherLocation?.latitude || !teacherLocation?.longitude) {
      return res.status(500).json({ msg: 'Teacher location not available' });
    }

    const distance = calculateDistance(
      teacherLocation.latitude,
      teacherLocation.longitude,
      latitude,
      longitude
    );

    if (distance > 80) {
      return res.status(403).json({ msg: `You are too far from the classroom (Distance: ${Math.round(distance)} meters)` });
    }

    // 6. Mark attendance
    attendanceSession.present_students.push({ student_id });
    await attendanceSession.save();

    return res.status(200).json({ msg: 'Attendance marked successfully', distance: Math.round(distance)});
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};


// join Community
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.body;  
    const studentId = req.user.id;     // via JWT middleware

    if (!communityId) {
      return res.status(400).json({ msg: 'Community ID is required' });
    }

    // 1. Check if community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }

    // 2. Check if student already a member
    if (community.students.includes(studentId)) {
      return res.status(400).json({ msg: 'You have already joined this community' });
    }

    // 3. Add student to community
    community.students.push(studentId);
    await community.save();

    // 4. Add community to student
    const student = await Student.findById(studentId);
    student.joined_communities.push(communityId);
    await student.save();

    return res.status(200).json({ msg: 'Joined community successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server Error', error: err.message });
  }
};



module.exports = {
  registerStudent,
  loginStudent,
  joinClassroom,
  markAttendance,
  joinCommunity,
}
