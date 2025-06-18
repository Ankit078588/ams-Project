const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, default: 'teacher' },
  
  teacher_id: { type: String, required: true, minlength: 8, unique: true },
  created_classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
}, { timestamps: true });




teacherSchema.pre('save', async function(next) {
  const user = this;
  if(!user.isModified('password')) return next();

  try{
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      user.password = hashedPassword;
      next();
  }catch(err){
      console.log('Error: '+ err);
      next(err);
  }
});


module.exports = mongoose.model('Teacher', teacherSchema);
