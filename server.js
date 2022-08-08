const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception shutting down');
  console.log(err.name);
  process.exit(1);
});

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('db connection successful');
  });

// const Tour = mongoose.model('Tour', tourSchema);
// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 4.7,
//   price: 497,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
// .catch((err) => console.log(err));
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // console.log('App running on port 3000....');
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection shutting down');
  console.log(err.name);
  server.close(() => {
    process.exit(1);
  });
});
