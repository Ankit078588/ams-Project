const mongoose = require("mongoose");


const attendanceSchema = new mongoose.Schema(
  {
    classroom_id: { type: String, required: true },   // same format as above
    teacher_id: { type: String, required: true },     // 8-digit teacher_id
    date: { type: Date, default: Date.now },
    teacherLocation: {
      latitude: Number,
      longitude: Number,
    },
    startTime: Date,
    endTime: Date,

    present_students: [{
        student_id: { type: String, required: true },
    }],
  },
  { timestamps: true }
);



module.exports = mongoose.model("Attendance", attendanceSchema);
