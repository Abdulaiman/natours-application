const User = require('../models/user-module');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const { deleteOne, updateOne, getOne, getAll } = require('./handler-factory');

const filterObj = (object, ...allowedFields) => {
  const newObj = {};
  Object.keys(object).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = object[el];
    }
  });
  return newObj;
};

exports.getAllUsers = getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   //// SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  ////  create error try to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'this route is not for password update please use /update-my-password'
      ),
      400
    );
  /// update the user document
  ////filtered out unwanted fieldsnames
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatesdUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatesdUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = getOne(User);

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'this route is not yet defined',
//   });
// };
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not defined: please use sign up instead',
  });
};
//// do not update passwords with this
exports.updateUser = updateOne(User);
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'this route is not yet defined',
//   });
// };

exports.deleteUser = deleteOne(User);
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'this route is not yet defined',
//   });
// };
