const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  name: String,
  email: String,
  password:String,
  verified: { type: Boolean, default: false },
  ph_no: String
  
});

const User = mongoose.model('User', userSchema);

module.exports = User;

