const express = require('express');
const router = express.Router();
const {
  sendRequest, acceptRequest, rejectRequest, removeConnection,
  getPendingRequests, getConnections, getConnectionStatus
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.post('/request/:userId', protect, sendRequest);
router.put('/accept/:connectionId', protect, acceptRequest);
router.put('/reject/:connectionId', protect, rejectRequest);
router.delete('/:connectionId', protect, removeConnection);
router.get('/pending', protect, getPendingRequests);
router.get('/status/:userId', protect, getConnectionStatus);
router.get('/', protect, getConnections);

module.exports = router;
