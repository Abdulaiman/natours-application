const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const ApiFeatures = require('../utils/api-Features');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`No document found with that id`, 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (model, popOpt) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const query = model.findById(id);
    if (popOpt) query.populate(popOpt);
    const doc = await query;
    // const doc = await model.findById(id).populate(popOpt);
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    //// to allow for nested getReviewsOnTour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new ApiFeatures(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    //// SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
