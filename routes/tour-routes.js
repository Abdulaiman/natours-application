const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tours-controller');
const { protect, restrictTo } = require('../controllers/auth-controller');
// const { createReview } = require('../controllers/reviews-controller');
const reviewRouter = require('./review-routes');

const router = express.Router();
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
// router.param('id', checkID);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
//// doesn't belong here
// router
//   .route('/:tourId/reviews')
//   .post(protect, restrictTo('user'), createReview);

module.exports = router;
