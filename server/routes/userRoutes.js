const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
