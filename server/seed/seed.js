const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Connection = require('../models/Connection');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillsync';

const seedUsers = [
  {
    name: 'Arjun Sharma',
    email: 'arjun@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'CSE', year: 3,
    bio: 'Competitive programmer and open source enthusiast. ICPC 2024 Regionalist.',
    skills: ['C++', 'DSA', 'Dynamic Programming', 'Graph Theory', 'React'],
    interests: ['Competitive Programming', 'Open Source'],
    githubUsername: 'torvalds',
    leetcodeUsername: 'tourist',
    codeforcesUsername: 'tourist',
    linkedinUrl: 'https://linkedin.com/in/arjunsharma',
    cpScore: 920, devScore: 780,
    cpBadge: 'Expert', devBadge: 'Expert Developer',
    ratingData: {
      leetcode: { rating: 2400, problemsSolved: 850 },
      codeforces: { rating: 2100, rank: 'International Master' },
      codechef: { rating: 2200, stars: 6 },
      github: { repos: 42, contributions: 1200, followers: 380, stars: 210 }
    }
  },
  {
    name: 'Priya Verma',
    email: 'priya@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'CSE', year: 4,
    bio: 'Full-stack developer and ML enthusiast. Building cool projects.',
    skills: ['React', 'Node.js', 'Python', 'Machine Learning', 'MongoDB'],
    interests: ['Web Development', 'Machine Learning', 'Startups'],
    githubUsername: 'gaearon',
    leetcodeUsername: 'neal_wu',
    linkedinUrl: 'https://linkedin.com/in/priyaverma',
    cpScore: 680, devScore: 890,
    cpBadge: 'Advanced', devBadge: 'Expert Developer',
    ratingData: {
      leetcode: { rating: 1900, problemsSolved: 560 },
      codeforces: { rating: 1400, rank: 'Expert' },
      github: { repos: 68, contributions: 1800, followers: 540, stars: 320 }
    }
  },
  {
    name: 'Rahul Gupta',
    email: 'rahul@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'IT', year: 2,
    bio: 'DSA beginner making steady progress. Looking for study partners.',
    skills: ['Java', 'DSA', 'Basics of Web Dev'],
    interests: ['Competitive Programming', 'Learning'],
    leetcodeUsername: 'tourist',
    codeforcesUsername: 'Petr',
    cpScore: 280, devScore: 120,
    cpBadge: 'Intermediate', devBadge: 'Beginner Developer',
    ratingData: {
      leetcode: { rating: 1350, problemsSolved: 145 },
      codeforces: { rating: 1100, rank: 'Pupil' },
      github: { repos: 8, contributions: 90, followers: 12, stars: 5 }
    }
  },
  {
    name: 'Sneha Patel',
    email: 'sneha@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'ECE', year: 3,
    bio: 'Passionate about embedded systems and IoT. Also love web dev!',
    skills: ['C', 'C++', 'Arduino', 'Python', 'React'],
    interests: ['IoT', 'Robotics', 'Web Development'],
    githubUsername: 'antirez',
    linkedinUrl: 'https://linkedin.com/in/snehapatel',
    cpScore: 410, devScore: 520,
    cpBadge: 'Intermediate', devBadge: 'Advanced Developer',
    ratingData: {
      leetcode: { rating: 1600, problemsSolved: 310 },
      github: { repos: 28, contributions: 640, followers: 95, stars: 78 }
    }
  },
  {
    name: 'Karan Mehta',
    email: 'karan@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'CSE', year: 4,
    bio: 'Backend developer with expertise in distributed systems and microservices.',
    skills: ['Go', 'Docker', 'Kubernetes', 'Node.js', 'PostgreSQL', 'Redis'],
    interests: ['Backend Development', 'DevOps', 'System Design'],
    githubUsername: 'kelseyhightower',
    linkedinUrl: 'https://linkedin.com/in/karanmehta',
    cpScore: 520, devScore: 860,
    cpBadge: 'Advanced', devBadge: 'Expert Developer',
    ratingData: {
      leetcode: { rating: 1750, problemsSolved: 420 },
      github: { repos: 55, contributions: 2100, followers: 430, stars: 290 }
    }
  },
  {
    name: 'Anjali Singh',
    email: 'anjali@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'CSE', year: 1,
    bio: 'First year student eager to learn everything about coding!',
    skills: ['Python', 'HTML', 'CSS'],
    interests: ['Web Development', 'AI/ML'],
    cpScore: 80, devScore: 40,
    cpBadge: 'Beginner', devBadge: 'Beginner Developer',
    ratingData: {
      leetcode: { rating: 800, problemsSolved: 32 },
      github: { repos: 3, contributions: 20, followers: 5, stars: 1 }
    }
  },
  {
    name: 'Vikram Nair',
    email: 'vikram@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'ME', year: 3,
    bio: 'Mechanical engineer who codes. Automating the boring stuff.',
    skills: ['Python', 'MATLAB', 'AutoCAD'],
    interests: ['Automation', 'Robotics'],
    cpScore: 160, devScore: 90,
    cpBadge: 'Beginner', devBadge: 'Beginner Developer',
    ratingData: {
      leetcode: { rating: 1050, problemsSolved: 78 },
      github: { repos: 5, contributions: 45, followers: 8, stars: 2 }
    }
  },
  {
    name: 'Divya Krishnan',
    email: 'divya@nitdelhi.ac.in',
    password: 'password123',
    college: 'NIT Delhi',
    branch: 'IT', year: 4,
    bio: 'Data scientist and ML researcher. Kaggle Competitions Master.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'R'],
    interests: ['Machine Learning', 'Data Science', 'Research'],
    githubUsername: 'goodfeli',
    leetcodeUsername: 'jiangly',
    linkedinUrl: 'https://linkedin.com/in/divyakrishnan',
    cpScore: 590, devScore: 720,
    cpBadge: 'Advanced', devBadge: 'Advanced Developer',
    ratingData: {
      leetcode: { rating: 1850, problemsSolved: 490 },
      codeforces: { rating: 1600, rank: 'Expert' },
      github: { repos: 35, contributions: 980, followers: 210, stars: 145 }
    }
  }
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Connection.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const createdUsers = await User.insertMany(seedUsers);
    console.log(`✅ Seeded ${createdUsers.length} users`);

    
    const connections = [
      { requester: createdUsers[0]._id, recipient: createdUsers[1]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[4]._id, status: 'accepted' },
      { requester: createdUsers[1]._id, recipient: createdUsers[3]._id, status: 'accepted' },
      { requester: createdUsers[2]._id, recipient: createdUsers[0]._id, status: 'pending' },
      { requester: createdUsers[5]._id, recipient: createdUsers[0]._id, status: 'pending' },
      { requester: createdUsers[3]._id, recipient: createdUsers[4]._id, status: 'accepted' },
    ];

    await Connection.insertMany(connections);
    console.log(`✅ Seeded ${connections.length} connections`);

    console.log('\n🎉 Seed complete! Login credentials:');
    seedUsers.forEach(u => console.log(`  📧 ${u.email} | 🔑 password123`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
