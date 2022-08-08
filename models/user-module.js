const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'please provide a pass word'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
  },
});
const User = mongoose.model('User', UserSchema);
module.exports = User;
