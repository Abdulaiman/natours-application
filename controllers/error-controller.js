const AppError = require('../utils/app-error');

const handleCastErrorDb = (err) => {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateKeyDb = (err) => {
  const message = `dupliacte field value "${err.keyValue.name}" please use another value`;
  return new AppError(message, 400);
};
const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleError = () => new AppError('invalid token please login again', 401);
const handleJwtExpired = () =>
  new AppError('your token is expired please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stact: err.stack,
    error: err,
  });
};
const sendErrorProd = (err, res) => {
  /// OPERATIONAL ERROR
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    ////PROGRAMMING ERROR
    //1) console.log(error)
    console.error('ERROR:', err);
    ///
    /// SEND ERROR TO CLIENT
    res.status(500).json({
      status: 'error',
      message: 'something went very Wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDb(error);
    if (error.code === 11000) error = handleDuplicateKeyDb(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDb(error);
    if (error.name === 'JsonWebTokenError') error = handleError();
    if (error.name === 'TokenExpiredError') error = handleJwtExpired();

    sendErrorProd(error, res);
  }
};
