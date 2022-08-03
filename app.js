const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tour-routes');
const userRouter = require('./routes/user-routes');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('hello from the middle ware ():?)');
  next();
});
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
module.exports = app;
// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev
