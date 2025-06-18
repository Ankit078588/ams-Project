const Student = require('../models/student');


const generateUniqueStudentId = async () => {
  let id;
  let exists = true;

  while (exists) {
    // Generate a random 12-digit number (as string)
    id = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    // Check uniqueness
    exists = await Student.findOne({ student_id: id });
  }

  return id;
};


module.exports = {
    generateUniqueStudentId
};
