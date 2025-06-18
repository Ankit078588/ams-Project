const classroom = require("../models/classroom");

// helper to generate unique 7-digit classroom_id
const generateUniqueClassroomId = async () => {
    let id;
    let exists = true;
  
    while (exists) {
      id = Math.floor(1000000 + Math.random() * 9000000).toString(); // 7-digit
      exists = await classroom.findOne({ classroom_id: id });
    }
  
    return id;
};


module.exports = {
    generateUniqueClassroomId
}