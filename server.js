const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({
  path: './config.env',
});
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
app.listen(port, () => {
  // console.log('App running on port 3000....');
});
// const x = 30;
// x = 89;
