const Tour = require('../models/tour-models');
const catchAsync = require('../utils/catch-async');

exports.getOverView = catchAsync(async (req, res, next) => {
  // get all tour data from collection
  const tours = await Tour.find();
  // build templare

  // render template

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // get all tour data from collection
  // console.log(req.params.slug);
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  // build templare

  // render template

  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'login',
  });
});
