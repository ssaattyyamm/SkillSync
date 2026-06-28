const axios = require('axios');

const getStarRating = (leetcodeData, codeforcesData, codechefData) => {
  const lcSolved   = leetcodeData?.problemsSolved   || 0;
  const cfSolved   = codeforcesData?.solved         || 0;
  const ccSolved   = codechefData?.solved           || 0;
  const totalSolved = lcSolved + cfSolved + ccSolved;

  const lcRating = leetcodeData?.rating   || 0;
  const cfRating = codeforcesData?.rating || 0;
  const ccRating = codechefData?.rating   || 0;

  
  if (totalSolved < 100) {
    return {
      stars: 1,
      tier: 'Newbie',
      reason: `${totalSolved} problems solved — solve 100 to reach 2 Stars`,
      totalSolved,
      phase: 1
    };
  }

  if (totalSolved < 300) {
    return {
      stars: 2,
      tier: 'Beginner',
      reason: `${totalSolved} problems solved — solve 300+ to unlock rating-based tiers`,
      totalSolved,
      phase: 1
    };
  }

  
  
  
  
  

  const bestRating = Math.max(cfRating, lcRating, ccRating);

  if (bestRating >= 2100) {
    return {
      stars: 7,
      tier: 'Grandmaster',
      reason: `${totalSolved} problems solved · Best rating: ${bestRating} (2100+)`,
      totalSolved,
      bestRating,
      phase: 2
    };
  }
  if (bestRating >= 1900) {
    return {
      stars: 6,
      tier: 'Master',
      reason: `${totalSolved} problems solved · Best rating: ${bestRating} (1900–2099)`,
      totalSolved,
      bestRating,
      phase: 2
    };
  }
  if (bestRating >= 1600) {
    return {
      stars: 5,
      tier: 'Expert',
      reason: `${totalSolved} problems solved · Best rating: ${bestRating} (1600–1899)`,
      totalSolved,
      bestRating,
      phase: 2
    };
  }
  if (bestRating >= 1400) {
    return {
      stars: 4,
      tier: 'Specialist',
      reason: `${totalSolved} problems solved · Best rating: ${bestRating} (1400–1599)`,
      totalSolved,
      bestRating,
      phase: 2
    };
  }

  
  return {
    stars: 3,
    tier: 'Intermediate',
    reason: `${totalSolved} problems solved · Best rating: ${bestRating} — reach 1400+ to get 4 Stars`,
    totalSolved,
    bestRating,
    phase: 2
  };
};

const starsToEmoji = (stars) => '⭐'.repeat(Math.min(stars, 7));

const starTierColor = (tier) => {
  const colors = {
    'Newbie':       '#94a3b8', 
    'Beginner':     '#10b981', 
    'Intermediate': '#3b82f6', 
    'Specialist':   '#8b5cf6', 
    'Expert':       '#f59e0b', 
    'Master':       '#f97316', 
    'Grandmaster':  '#ef4444', 
  };
  return colors[tier] || '#94a3b8';
};

const calculateCPScore = (leetcodeData, codeforcesData, codechefData) => {
  let score = 0;

  
  if (leetcodeData) {
    const { rating = 0, problemsSolved = 0 } = leetcodeData;
    score += Math.min(problemsSolved * 0.3, 150); 
    score += Math.min(rating / 6, 200);            
  }

  
  if (codeforcesData?.rating) {
    score += Math.min(codeforcesData.rating / 5.25, 400);
  }

  
  if (codechefData?.rating) {
    score += Math.min(codechefData.rating / 12.5, 200);
  }

  
  const starInfo = getStarRating(leetcodeData, codeforcesData, codechefData);
  score += starInfo.stars * 7;

  return Math.round(Math.min(score, 1000));
};

const getCPBadge = (score) => {
  if (score >= 750) return 'Expert';
  if (score >= 500) return 'Advanced';
  if (score >= 250) return 'Intermediate';
  return 'Beginner';
};

const calculateDevScore = (githubData) => {
  if (!githubData) return 0;
  const { repos = 0, contributions = 0, followers = 0, stars = 0 } = githubData;
  let score = 0;
  score += Math.min(repos * 10, 300);
  score += Math.min(contributions * 0.5, 400);
  score += Math.min(followers * 2, 150);
  score += Math.min(stars * 5, 150);
  return Math.round(Math.min(score, 1000));
};

const getDevBadge = (score) => {
  if (score >= 750) return 'Expert Developer';
  if (score >= 500) return 'Advanced Developer';
  if (score >= 250) return 'Intermediate Developer';
  return 'Beginner Developer';
};

const fetchLeetCodeData = async (username) => {
  try {
    if (!username) return null;
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats: submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
          profile { ranking }
        }
        userContestRanking(username: $username) {
          rating
          attendedContestsCount
          globalRanking
        }
      }
    `;
    const response = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username } },
      { headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com', 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }
    );
    const data = response.data?.data;
    const user = data?.matchedUser;
    if (!user) return null;

    const totalSolved = user.submitStats?.acSubmissionNum?.find(s => s.difficulty === 'All')?.count || 0;
    const contestRating = Math.round(data?.userContestRanking?.rating || 0);
    const ranking = user.profile?.ranking || 0;
    const estimatedRating = ranking > 0 ? Math.max(0, 2000 - Math.floor(ranking / 5000)) : 0;
    const rating = contestRating > 0 ? contestRating : estimatedRating;

    console.log(`✅ LeetCode [${username}]: rating=${rating}, solved=${totalSolved}`);
    return { rating, problemsSolved: totalSolved };
  } catch (err) {
    console.log(`⚠️  LeetCode failed [${username}]:`, err.message);
    return null;
  }
};

const fetchCodeforcesData = async (username) => {
  try {
    if (!username) return null;
    const [infoRes, statusRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${username}`, { timeout: 8000 }),
      axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`, { timeout: 8000 })
        .catch(() => ({ data: { status: 'FAILED', result: [] } }))
    ]);

    if (infoRes.data.status !== 'OK') return null;
    const user = infoRes.data.result[0];

    
    const accepted = statusRes.data?.result || [];
    const uniqueSolved = new Set(
      accepted.filter(s => s.verdict === 'OK').map(s => `${s.problem.contestId}-${s.problem.index}`)
    ).size;

    console.log(`✅ Codeforces [${username}]: rating=${user.rating || 0}, solved=${uniqueSolved}`);
    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      solved: uniqueSolved
    };
  } catch (err) {
    console.log(`⚠️  Codeforces failed [${username}]:`, err.message);
    return null;
  }
};

const fetchCodeChefData = async (username) => {
  try {
    if (!username) return null;
    const response = await axios.get(
      `https://www.codechef.com/users/${username}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }
    );
    const html = response.data;
    const ratingMatch = html.match(/class="rating-number">(\d+)<\/span>/);
    const starsMatch  = html.match(/(\d)\s*★/) || html.match(/(\d)-star/);
    const solvedMatch = html.match(/(\d+)\s*<\/small>\s*<h5>Fully Solved/i)
                     || html.match(/Fully Solved[^>]*>(\d+)/i);

    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    const stars  = starsMatch  ? parseInt(starsMatch[1])  : 0;
    const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

    if (rating > 0) {
      console.log(`✅ CodeChef [${username}]: rating=${rating}, stars=${stars}, solved=${solved}`);
      return { rating, stars, solved };
    }
    return null;
  } catch (err) {
    console.log(`⚠️  CodeChef failed [${username}]:`, err.message);
    return null;
  }
};

const fetchGitHubData = async (username) => {
  try {
    if (!username) return null;
    const headers = {
      'User-Agent': 'SkillSync-App',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    };
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, { headers, timeout: 8000 }),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers, timeout: 8000 })
    ]);
    const user  = userRes.data;
    const repos = reposRes.data;
    const totalStars  = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const ownRepos    = repos.filter(r => !r.fork);
    const recentRepos = repos.filter(r => new Date(r.updated_at) > new Date(Date.now() - 365*24*60*60*1000));
    const contributions = (ownRepos.length * 15) + (recentRepos.length * 10);

    console.log(`✅ GitHub [${username}]: repos=${user.public_repos}, stars=${totalStars}`);
    return { repos: user.public_repos || 0, followers: user.followers || 0, stars: totalStars, contributions };
  } catch (err) {
    console.log(`⚠️  GitHub failed [${username}]:`, err.message);
    return null;
  }
};

module.exports = {
  getStarRating,
  starsToEmoji,
  starTierColor,
  calculateCPScore,
  getCPBadge,
  calculateDevScore,
  getDevBadge,
  fetchLeetCodeData,
  fetchCodeforcesData,
  fetchCodeChefData,
  fetchGitHubData
};
