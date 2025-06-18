require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/db_connection')
const PORT = 3000;



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);







app.post('/teacher/start-attendance', async (req, res) => {
    const { latitude, longitude } = req.body;
    console.log('Latitude recieved: ', latitude);
    console.log('Longitude recieved: ', longitude);
    

    if (!latitude || !longitude) {
        return res.status(400).send('Latitude and longitude are required.');
    }

    const attendanceSession = new Attendance({
        teacherId: req.user._id, // Assuming user is authenticated
        teacherLocation: { latitude, longitude },
        startTime: new Date(),
    });

    await attendanceSession.save();
    res.redirect('/teacher/dashboard');
});
app.post('/student/mark-attendance', async (req, res) => {
    const { latitude, longitude } = req.body;

    const activeSession = await Attendance.findOne({
        endTime: null,
    });

    if (!activeSession) {
        return res.status(400).send('No active attendance session.');
    }

    const distance = calculateDistance(
        activeSession.teacherLocation.latitude,
        activeSession.teacherLocation.longitude,
        latitude,
        longitude
    );

    if (distance > 70) {
        return res.status(400).send('You are too far from the teacher to mark attendance.');
    }

    activeSession.students.push({
        studentId: req.user._id, // Assuming user is authenticated
        time: new Date(),
    });

    await activeSession.save();
    res.redirect('/student/dashboard');
});


// Start the server
app.listen(PORT, () => {
    console.log(`Attendance Management System running on port ${PORT}`);
});
