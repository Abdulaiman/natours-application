const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  aliasTopTours,
} = require('../controllers/tours-controller');

const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
// router.param('id', checkID);
router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = router;
