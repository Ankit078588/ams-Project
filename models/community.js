const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },                // Eg: "Shaitanik Chakroborty's Community"
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    unique: true   // One community per teacher
  },

  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],

  posts: [{
    content: { type: String },
    postedAt: { type: Date, default: Date.now },
    file: {
      buffer: Buffer,
      mimetype: String,
      filename: String
    }
  }]
});

module.exports = mongoose.model('Community', communitySchema);
