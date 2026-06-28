const User = require('../models/User');
const {
  fetchLeetCodeData, fetchCodeforcesData, fetchCodeChefData, fetchGitHubData,
  calculateCPScore, getCPBadge, calculateDevScore, getDevBadge,
  getStarRating
} = require('../utils/ratingUtils');

const refreshScores = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    
    if (user.lastScoreUpdate) {
      const diff = Date.now() - new Date(user.lastScoreUpdate).getTime();
      if (diff < 5 * 60 * 1000) {
        const remainingSecs = Math.ceil((5 * 60 * 1000 - diff) / 1000);
        return res.status(429).json({
          success: false,
          message: `Wait ${remainingSecs}s before refreshing again`
        });
      }
    }

    console.log(`\n🔄 Refreshing: ${user.name}`);

    const [leetcodeData, codeforcesData, codechefData, githubData] = await Promise.all([
      fetchLeetCodeData(user.leetcodeUsername),
      fetchCodeforcesData(user.codeforcesUsername),
      fetchCodeChefData(user.codechefUsername),
      fetchGitHubData(user.githubUsername)
    ]);

    const existing = user.ratingData?.toObject ? user.ratingData.toObject() : (user.ratingData || {});
    const now = new Date();

    const ratingData = {
      leetcode: leetcodeData
        ? { ...leetcodeData, lastUpdated: now }
        : (existing.leetcode || { rating: 0, problemsSolved: 0 }),
      codeforces: codeforcesData
        ? { ...codeforcesData, lastUpdated: now }
        : (existing.codeforces || { rating: 0, rank: '', solved: 0 }),
      codechef: codechefData
        ? { ...codechefData, lastUpdated: now }
        : (existing.codechef || { rating: 0, stars: 0, solved: 0 }),
      github: githubData
        ? { ...githubData, lastUpdated: now }
        : (existing.github || { repos: 0, contributions: 0, followers: 0, stars: 0 })
    };

    const cpScore    = calculateCPScore(ratingData.leetcode, ratingData.codeforces, ratingData.codechef);
    const devScore   = calculateDevScore(ratingData.github);
    const starRating = getStarRating(ratingData.leetcode, ratingData.codeforces, ratingData.codechef);

    console.log(`⭐ Stars: ${starRating.stars} (${starRating.tier}) | CP: ${cpScore} | DEV: ${devScore}`);

    await User.findByIdAndUpdate(req.user._id, {
      ratingData,
      cpScore,
      devScore,
      cpBadge: getCPBadge(cpScore),
      devBadge: getDevBadge(devScore),
      starRating,
      lastScoreUpdate: now
    });

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      message: 'Scores refreshed!',
      user: updatedUser,
      fetched: {
        leetcode: !!leetcodeData,
        codeforces: !!codeforcesData,
        codechef: !!codechefData,
        github: !!githubData
      },
      scores: { cpScore, devScore, stars: starRating.stars, tier: starRating.tier }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name ratingData cpScore devScore cpBadge devBadge starRating lastScoreUpdate leetcodeUsername codeforcesUsername codechefUsername githubUsername'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, ratings: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setManualScores = async (req, res) => {
  try {
    const { leetcodeRating, leetcodeSolved, codeforcesRating, codeforcesSolved, codechefRating, codechefStars, codechefSolved, githubRepos, githubContributions, githubFollowers, githubStars } = req.body;

    const ratingData = {
      leetcode:   { rating: leetcodeRating || 0,   problemsSolved: leetcodeSolved || 0,     lastUpdated: new Date() },
      codeforces: { rating: codeforcesRating || 0, solved: codeforcesSolved || 0,            lastUpdated: new Date() },
      codechef:   { rating: codechefRating || 0,   stars: codechefStars || 0, solved: codechefSolved || 0, lastUpdated: new Date() },
      github:     { repos: githubRepos || 0,        contributions: githubContributions || 0, followers: githubFollowers || 0, stars: githubStars || 0, lastUpdated: new Date() }
    };

    const cpScore    = calculateCPScore(ratingData.leetcode, ratingData.codeforces, ratingData.codechef);
    const devScore   = calculateDevScore(ratingData.github);
    const starRating = getStarRating(ratingData.leetcode, ratingData.codeforces, ratingData.codechef);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ratingData, cpScore, devScore, cpBadge: getCPBadge(cpScore), devBadge: getDevBadge(devScore), starRating, lastScoreUpdate: new Date() },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Scores updated manually', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { refreshScores, getUserRatings, setManualScores };
