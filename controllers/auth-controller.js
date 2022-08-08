const User = require('../models/user-module');
const catchAsync = require('../utils/catch-async');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
