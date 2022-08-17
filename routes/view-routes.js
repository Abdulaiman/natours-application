const express = require('express');
const {
  getOverView,
  getTour,
  getLoginForm,
} = require('../controllers/views-controller');
const { isLoggedIn } = require('../controllers/auth-controller');

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOverView);
router.get('/tour/:slug', getTour);
router.get('/login', getLoginForm);
module.exports = router;
