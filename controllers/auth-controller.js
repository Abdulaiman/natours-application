const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user-module');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  ////CHECK IF EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('please provide email and password'), 400);
  }
  ////CHECK IF EMAIL EXIST IN DATABASE

  const user = await User.findOne({ email }).select('+password');

  ////CHECK IF PASSWORD IS CORRECT

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  /////EVERYTHING"S OKAY
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  ///// GET THE TOKEN AND CHECK IF IT EXIST
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('you are not logged in, please login to get access'),
      401
    );
  }
  ///// VERIFY THE TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWTSECRET);

  ///// CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('the user does no longer exist'), 401);
  ///// CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password! please log in again')
    );
  }

  ///// GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
