const User = require('../models/User');
const Connection = require('../models/Connection');

const getDashboardData = async (req, res) => {
  try {
    const currentUser = req.user;

    
    const topCoders = await User.find({
      college: currentUser.college,
      _id: { $ne: currentUser._id },
      cpScore: { $gt: 0 }
    })
      .select('name profilePicture branch year cpScore cpBadge skills')
      .sort({ cpScore: -1 })
      .limit(5);

    
    const topDevelopers = await User.find({
      college: currentUser.college,
      _id: { $ne: currentUser._id },
      devScore: { $gt: 0 }
    })
      .select('name profilePicture branch year devScore devBadge skills githubUsername')
      .sort({ devScore: -1 })
      .limit(5);

    
    const recentRequests = await Connection.find({
      recipient: currentUser._id,
      status: 'pending'
    })
      .populate('requester', 'name profilePicture branch year cpScore devScore cpBadge skills')
      .sort({ createdAt: -1 })
      .limit(5);

    
    const connectedUserIds = await Connection.find({
      $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
      status: { $in: ['accepted', 'pending'] }
    }).then(conns =>
      conns.map(c =>
        c.requester.toString() === currentUser._id.toString() ? c.recipient : c.requester
      )
    );

    const recommended = await User.find({
      college: currentUser.college,
      _id: { $ne: currentUser._id, $nin: connectedUserIds },
      $or: [
        { skills: { $in: currentUser.skills } },
        { interests: { $in: currentUser.interests } },
        { branch: currentUser.branch }
      ]
    })
      .select('name profilePicture branch year skills cpScore devScore cpBadge devBadge')
      .limit(6);

    
    const connectionCount = await Connection.countDocuments({
      $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
      status: 'accepted'
    });

    const pendingCount = await Connection.countDocuments({
      recipient: currentUser._id,
      status: 'pending'
    });

    res.json({
      success: true,
      dashboard: {
        topCoders,
        topDevelopers,
        recentRequests,
        recommended,
        stats: {
          connectionCount,
          pendingCount,
          cpScore: currentUser.cpScore,
          devScore: currentUser.devScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardData };
