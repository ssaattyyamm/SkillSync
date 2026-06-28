const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  college: { type: String, required: true, trim: true },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'CHE', 'Other']
  },
  year: { type: Number, required: true, enum: [1, 2, 3, 4] },
  bio: { type: String, maxlength: 500, default: '' },
  profilePicture: { type: String, default: '' },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],

  
  linkedinUrl: { type: String, default: '' },
  githubUsername: { type: String, default: '' },
  leetcodeUsername: { type: String, default: '' },
  codeforcesUsername: { type: String, default: '' },
  codechefUsername: { type: String, default: '' },

  
  cpScore: { type: Number, default: 0 },
  devScore: { type: Number, default: 0 },
  cpBadge: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  devBadge: {
    type: String,
    enum: ['Beginner Developer', 'Intermediate Developer', 'Advanced Developer', 'Expert Developer'],
    default: 'Beginner Developer'
  },

  
  starRating: {
    stars: { type: Number, default: 0, min: 0, max: 7 },
    tier: {
      type: String,
      enum: ['Newbie', 'Beginner', 'Intermediate', 'Specialist', 'Expert', 'Master', 'Grandmaster', ''],
      default: ''
    },
    totalSolved: { type: Number, default: 0 },
    bestRating: { type: Number, default: 0 },
    reason: { type: String, default: '' }
  },

  
  ratingData: {
    leetcode: {
      rating: { type: Number, default: 0 },
      problemsSolved: { type: Number, default: 0 },
      lastUpdated: Date
    },
    codeforces: {
      rating: { type: Number, default: 0 },
      maxRating: { type: Number, default: 0 },
      rank: { type: String, default: '' },
      solved: { type: Number, default: 0 },
      lastUpdated: Date
    },
    codechef: {
      rating: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      solved: { type: Number, default: 0 },
      lastUpdated: Date
    },
    github: {
      repos: { type: Number, default: 0 },
      contributions: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      lastUpdated: Date
    }
  },

  lastScoreUpdate: { type: Date, default: null },
  isActive: { type: Boolean, default: true },

  
  resetOTP: { type: String, select: false },
  resetOTPExpire: { type: Date, select: false },
  resetOTPAttempts: { type: Number, default: 0, select: false }

}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ college: 1, branch: 1, year: 1 });
userSchema.index({ cpScore: -1, devScore: -1 });
userSchema.index({ 'starRating.stars': -1 });
userSchema.index({ name: 'text', skills: 'text' });

module.exports = mongoose.model('User', userSchema);
