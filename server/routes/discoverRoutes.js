const express = require('express');
const router = express.Router();
const { discoverStudents } = require('../controllers/discoverController');
const { protect } = require('../middleware/auth');

router.get('/', protect, discoverStudents);

module.exports = router;
