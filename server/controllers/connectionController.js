const Connection = require('../models/Connection');
const User = require('../models/User');

const sendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    
    const existing = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already connected' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'Request already sent' });
      }
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.requester = req.user._id;
        existing.recipient = recipientId;
        await existing.save();
        return res.json({ success: true, message: 'Connection request sent' });
      }
    }

    await Connection.create({ requester: req.user._id, recipient: recipientId });
    res.status(201).json({ success: true, message: 'Connection request sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    connection.status = 'accepted';
    await connection.save();

    res.json({ success: true, message: 'Connection accepted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({ success: true, message: 'Connection request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.connectionId);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    const isParty =
      connection.requester.toString() === req.user._id.toString() ||
      connection.recipient.toString() === req.user._id.toString();

    if (!isParty) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await connection.deleteOne();
    res.json({ success: true, message: 'Connection removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'name email profilePicture branch year college cpScore devScore cpBadge devBadge skills');

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'accepted'
    })
      .populate('requester', 'name email profilePicture branch year college cpScore devScore cpBadge devBadge skills githubUsername linkedinUrl')
      .populate('recipient', 'name email profilePicture branch year college cpScore devScore cpBadge devBadge skills githubUsername linkedinUrl');

    const formatted = connections.map(conn => {
      const friend =
        conn.requester._id.toString() === req.user._id.toString()
          ? conn.recipient
          : conn.requester;
      return { connectionId: conn._id, user: friend, connectedAt: conn.updatedAt };
    });

    res.json({ success: true, connections: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConnectionStatus = async (req, res) => {
  try {
    const connection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: req.params.userId },
        { requester: req.params.userId, recipient: req.user._id }
      ]
    });

    if (!connection) return res.json({ success: true, status: 'none', connection: null });

    const isRequester = connection.requester.toString() === req.user._id.toString();
    res.json({ success: true, status: connection.status, isRequester, connection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getPendingRequests,
  getConnections,
  getConnectionStatus
};
