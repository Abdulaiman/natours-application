const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/users-controller');
const {
  signUp,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/auth-controller');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.use(protect);
router.patch('/update-my-password', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);

router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUser);

module.exports = router;
