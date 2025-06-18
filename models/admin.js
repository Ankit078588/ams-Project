const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },

  created_classroom: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
}, { timestamps: true });



adminSchema.pre('save', async function(next) {
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


module.exports = mongoose.model('Admin', adminSchema);

