const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  deleteTour,
  updateTour,
  checkID,
  checkBody,
} = require('../controllers/tours-controller');
const router = express.Router();

router.param('id', checkID);
router.route('/').get(getAllTours).post(checkBody, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
module.exports = router;
