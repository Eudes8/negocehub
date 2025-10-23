const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users/me
// @desc    Get user profile
// @access  Private
router.get('/me', auth, getUserProfile);

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, updateUserProfile);

module.exports = router;