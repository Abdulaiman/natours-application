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
} = require('../controllers/users-controller');
const {
  signUp,
  login,
  resetPassword,
  forgotPassword,
  updatePassword,
  protect,
} = require('../controllers/auth-controller');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/update-my-password', protect, updatePassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-me', protect, updateMe);
router.delete('/delete-me', protect, deleteMe);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUser);
module.exports = router;
