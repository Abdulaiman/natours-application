const express = require('express');
const { getOverView, getTour } = require('../controllers/views-controller');

const router = express.Router();

router.get('/', getOverView);
router.get('/tour', getTour);

module.exports = router;
