const express = require('express');
const router = express.Router();
const { refreshScores, getUserRatings, setManualScores } = require('../controllers/ratingController');
const { protect } = require('../middleware/auth');

router.post('/refresh', protect, refreshScores);
router.put('/manual', protect, setManualScores);
router.get('/:userId', protect, getUserRatings);

module.exports = router;
