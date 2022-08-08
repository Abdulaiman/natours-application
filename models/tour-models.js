const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'maximum tour name exceeded, it should have less than or equal 40',
      ],
      minLength: [10, 'cannot have a name with less than 10 characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'tour must have a group sixr'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1.0'],
      max: [5, 'the max should be less than 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    difficulty: {
      type: String,
      required: [true, 'a Tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty is either easy, medium or hard',
      },
    },
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: [true, 'a tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          /// only work when  creating a new document not on updates
          return val < this.price;
        },
        message: 'discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      dafault: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//// document middleware and it runs before the .save() and .create();
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   console.log('will save a document to the dataBase');
//   next();
// });
// ///

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
////////QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // tourSchema.pre('find', function (next) {
  console.log(Date.now() - this.start);
  this.find({ secretTour: { $ne: true } });
  next();
});
////// AGGREGATION SCHEMA
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
