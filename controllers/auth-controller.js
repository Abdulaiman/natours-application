const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user-module');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    ////SET THE EXPIRY DATE OF THE COOKIE FROM THE BROWSER
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    ////MAKE IT WORK FOR ONLY HTTPS REQUESTS
    // secure: true,
    /////MAKE THE PAYLOAD UNMODEFIABLE
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  /// remove password from the output... but since we didn't save it is still in our database
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createAndSendToken(newUser, 201, res);
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  ////CHECK IF EMAIL AND PASSWORD EXIST
  // console.log(email, password);
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
  createAndSendToken(user, 200, res);
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
  console.log(decoded);
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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    ////roles [admin, leadAdmin].

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }

    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //// get user based on pasted email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('there is no user with this email address', 404));
  // generate the random token

  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });
  // send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset-password/${resetToken}`;

  console.log(resetURL);

  const message = `forgot your password? submit a patch request with your new password and your passwordConfirm to: ${resetURL}.\n if you didn't forgot your password please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token is valid for 10 min',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    // user.passwordResetToken = undefined;
    // user.passwordResetExpires = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    return next(new AppError(err.message), 500);
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  ////get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  ///if token has not expired and there is a user... set the new password
  if (!user) return next(new AppError('token is invalid or has expired'), 400);
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  ////update the changedPasswordAt property

  ////log the user
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  ///// GET THE USER FROM THE COLLECTION
  const user = await User.findOne({ _id: req.user.id }).select('+password');
  // console.log(user);
  ////CHECK IF THE PASSWORD IS CORRECT
  const correct = await user.correctPassword(req.body.password, user.password);

  if (!correct) return next(new AppError('invalid password', 401));
  //// IF SO UPDATE PASSWORD
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  /// LOG USER IN SEND JTW
  createAndSendToken(user, 200, res);
});
