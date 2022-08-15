const Tour = require('./../models/tour-models');
const ApiFeatures = require('../utils/api-Features');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handler-factory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '_ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

///////////////////////?********REFACTORED********??????????????////////////
exports.getAllTours = getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
////// build the query
///FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// /////  ADVANCED FILTERING
// let queryString = JSON.stringify(queryObj);
// queryString = queryString.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );
// let query = Tour.find(JSON.parse(queryString));
///
//////SORTING
//
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }
/////
//FIELD LIMITING
//
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }
/////
/////PAGINATION
//////
// const page = +req.query.page || 1;
// const limit = +req.query.limit || 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);
// if (req.query.page) {
//   const numOfTours = await Tour.countDocuments();
//   if (skip >= numOfTours) throw new Error('This page does not exist');
// }

// {difficulty: 'easy', duration: {$gte: 5}}
//{ difficulty: 'easy', duration: { gte: '5' } }
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');
/////// execute the Query
//   const features = new ApiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;
//   //// SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });
exports.getTour = getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const tour = await Tour.findById(id).populate('reviews');
//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.createTour = createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.updateTour = updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.deleteTour = deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

//
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);
  // {
  //   $match: { _id: { $ne: 'EASY' } },
  // },
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mile' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    next(
      new AppError('please provide a lat and lng in the format lat,lng'),
      400
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, latlng, unit);
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    next(
      new AppError('please provide a lat and lng in the format lat,lng'),
      400
    );

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  console.log(latlng, unit);
  res.status(200).json({
    status: 'success',
    result: distances.length,
    data: {
      data: distances,
    },
  });
});
///////// simpler one above;

/////
////
// exports.getAllTours = async (req, res) => {
//   try {
//     ////// build the query
//     ///FILTERING
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // /////  ADVANCED FILTERING
//     // let queryString = JSON.stringify(queryObj);
//     // queryString = queryString.replace(
//     //   /\b(gte|gt|lte|lt)\b/g,
//     //   (match) => `$${match}`
//     // );
//     // let query = Tour.find(JSON.parse(queryString));
//     ///
//     //////SORTING
//     //
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt');
//     // }
//     /////
//     //FIELD LIMITING
//     //
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(',').join(' ');
//     //   query = query.select(fields);
//     // } else {
//     //   query = query.select('-__v');
//     // }
//     /////
//     /////PAGINATION
//     //////
//     // const page = +req.query.page || 1;
//     // const limit = +req.query.limit || 100;
//     // const skip = (page - 1) * limit;
//     // query = query.skip(skip).limit(limit);
//     // if (req.query.page) {
//     //   const numOfTours = await Tour.countDocuments();
//     //   if (skip >= numOfTours) throw new Error('This page does not exist');
//     // }

//     // {difficulty: 'easy', duration: {$gte: 5}}
//     //{ difficulty: 'easy', duration: { gte: '5' } }
//     // const tours = await Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy');
//     /////// execute the Query
//     const features = new ApiFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const tours = await features.query;
//     //// SEND RESPONSE
//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err.message,
//     });
//   }
// };
// exports.getTour = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const tour = await Tour.findById(id);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
// exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
// exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };

// //
// exports.getTourStats = async (req, res) => {
//   try {
//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } },
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$difficulty' },
//           numTours: { $sum: 1 },
//           numRatings: { $sum: '$ratingsQuantity' },
//           avgRating: { $avg: '$ratingsAverage' },
//           avgPrice: { $avg: '$price' },
//           minPrice: { $min: '$price' },
//           maxPrice: { $max: '$price' },
//         },
//       },
//       {
//         $sort: {
//           avgPrice: 1,
//         },
//       },
//     ]);
//     // {
//     //   $match: { _id: { $ne: 'EASY' } },
//     // },
//     res.status(200).json({
//       status: 'success',
//       data: {
//         stats,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };

// exports.getMonthlyPlan = async (req, res) => {
//   try {
//     const { year } = req.params;
//     const plan = await Tour.aggregate([
//       {
//         $unwind: '$startDates',
//       },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTourStart: { $sum: 1 },
//           tours: { $push: '$name' },
//         },
//       },
//       {
//         $addFields: {
//           month: '$_id',
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//         },
//       },
//       {
//         $sort: { numTourStart: -1 },
//       },
//       {
//         $limit: 12,
//       },
//     ]);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         plan,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'failed',
//       message: err,
//     });
//   }
// };
