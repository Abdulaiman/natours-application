const Review = require('../models/review-model');
const catchAsync = require('../utils/catch-async');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handler-factory');

exports.getAllReviews = getAll(Review);
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTourAndUserIds = (req, res, next) => {
  ///// creating nested routess
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = createOne(Review);
// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
