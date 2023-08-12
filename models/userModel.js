const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Define user schema fields here
  _id: String,
  name: String,
  email: String,
  password:String,
  verified: Boolean,
  ph_no: String
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;

