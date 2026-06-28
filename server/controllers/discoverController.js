const User = require('../models/User');

const discoverStudents = async (req, res) => {
  try {
    const {
      search, skills, branch, year, sortBy = 'cpScore', page = 1, limit = 12
    } = req.query;

    const query = {
      _id: { $ne: req.user._id },
      college: req.user.college, 
      isActive: true
    };

    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    
    if (branch) query.branch = branch;

    
    if (year) query.year = parseInt(year);

    const sortOptions = {};
    if (sortBy === 'cpScore') sortOptions.cpScore = -1;
    else if (sortBy === 'devScore') sortOptions.devScore = -1;
    else if (sortBy === 'name') sortOptions.name = 1;
    else if (sortBy === 'newest') sortOptions.createdAt = -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('name email profilePicture branch year skills cpScore devScore cpBadge devBadge bio githubUsername linkedinUrl')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { discoverStudents };
