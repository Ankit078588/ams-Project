const mongoose = require('mongoose');


const AttendanceSchema = new mongoose.Schema({
    teacherId: mongoose.Schema.Types.ObjectId,
    teacherLocation: {
        latitude: Number,
        longitude: Number,
    },
    students: [
        {
            studentId: mongoose.Schema.Types.ObjectId,
            time: Date,
        },
    ],
    startTime: Date,
    endTime: Date,
});


module.exports = mongoose.model('Attendance', AttendanceSchema);