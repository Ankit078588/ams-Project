const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(404).json({ msg: 'Both email & password is required.' });
    }

    // check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ msg: 'Admin already exists' });

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    res.status(201).json({ msg: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
};


// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(404).json({ msg: 'Both email & password is required.' });
    }

    // console.log(email, password);
    // console.log(process.env.JWT_SECRET);

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log(isMatch);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign( { id: admin._id, role: admin.role }, process.env.JWT_SECRET);
    
    res.status(200).json({ token, msg: 'Login successful' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error', error: error.message });
  }
};



module.exports = {
  registerAdmin,
  loginAdmin
}
