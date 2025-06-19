const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true },
  role: { type: String, default: 'student' },

  student_id: { type: String, minlength: 12, unique: true},
  joined_classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  joined_communities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }]
}, { timestamps: true });


studentSchema.pre('save', async function(next) {
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


module.exports = mongoose.model('Student', studentSchema);

