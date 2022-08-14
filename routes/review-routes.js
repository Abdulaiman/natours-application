const express = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview,
} = require('../controllers/reviews-controller');
const { protect, restrictTo } = require('../controllers/auth-controller');

const router = express.Router({ mergeParams: true });
router.use(protect);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);
module.exports = router;
