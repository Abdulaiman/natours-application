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

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'],
    unique: true,
  },
  rating: { type: Number, default: 44.5 },
  price: { type: Number, required: [true, 'a tour must have a price'] },
});
const Tour = mongoose.model('Tour', tourSchema);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  // console.log('App running on port 3000....');
});
// const x = 30;
// x = 89;
