const express = require('express');
const app = express();
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/error-controller');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
const AppError = require('./utils/app-error');

///// GLOBAL MIDDLEWARE
/// SET SECURITY HTTP HEADERS
app.use(helmet());

//// DEVELOPMENT LOGGINF
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
////LIMIT REQUEST FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many req from this ip please try again in an hour',
});

app.use('/api', limiter);
//// BODY PARSER>> READING DATA FROM THE BODY INTO req.body
app.use(
  express.json({
    limit: '10kb',
  })
);

//// data sanitization against noSQL query injection

// app.use(mongoSanitize());

//// data sanitization against XSS
app.use(xss());

//// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
////serving static files
app.use(express.static(`${__dirname}/public`));
///// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

///////

///////
//////
//////
/////
/////
/////

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

///// ROUTE HANDLEr FOR UNDEFINED ROUTE
app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

/////GLOBAL ERROR HANDLING
app.use(globalErrorHandler);
module.exports = app;
// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
