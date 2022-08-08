const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} = require('../controllers/users-controller');
const { signUp } = require('../controllers/auth-controller');

router.post('/signup', signUp);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deleteUser).get(getUser);
module.exports = router;
