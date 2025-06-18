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
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);








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
