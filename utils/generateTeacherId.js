const Teacher = require('../models/teacher');


const generateUniqueTeacherId = async () => {
  let unique = false;
  let id;

  while (!unique) {
    id = Math.floor(10000000 + Math.random() * 90000000).toString(); // generates 8-digit number
    const existing = await Teacher.findOne({ teacher_id: id });
    if (!existing) unique = true;
  }

  return id;
};


module.exports = generateUniqueTeacherId;
