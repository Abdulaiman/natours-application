const express = require('express');
const app = express();
const AppError = require('./utils/app-error');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/error-controller');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

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
