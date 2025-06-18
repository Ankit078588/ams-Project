const mongoose = require('mongoose');


const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classroom_id: { type: String, required: true, unique: true },      // 7-digit unique code
  teacher_id: { type: String, required: true },                      // stored as string (not ObjectId)

  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, { timestamps: true });



module.exports = mongoose.model('Classroom', classroomSchema);

