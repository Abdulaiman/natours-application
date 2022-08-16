const Tour = require('../models/tour-models');
const catchAsync = require('../utils/catch-async');

exports.getOverView = catchAsync(async (req, res) => {
  // get all tour data from collection
  const tours = await Tour.find();
  // build templare

  // render template

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'the forest hiker',
  });
};
