const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password, college, branch, year } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, college, branch, year });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpire +resetOTPAttempts');
    if (!user) {
      
      return res.json({
        success: true,
        message: 'If this email is registered, an OTP has been sent.'
      });
    }

    
    if (user.resetOTPExpire && user.resetOTPExpire > Date.now()) {
      const remaining = Math.ceil((user.resetOTPExpire - Date.now()) / 60000);
      if (user.resetOTPAttempts >= 3) {
        return res.status(429).json({
          success: false,
          message: `Too many OTP requests. Please wait ${remaining} minute(s) before trying again.`
        });
      }
    }

    
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

    
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp, salt);

    
    user.resetOTP = hashedOTP;
    user.resetOTPExpire = otpExpire;
    user.resetOTPAttempts = (user.resetOTPAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });

    
    await sendOTPEmail(user.email, otp, user.name);

    res.json({
      success: true,
      message: `OTP sent to ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}. Valid for 10 minutes.`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    await User.findOneAndUpdate(
      { email: req.body.email },
      { $unset: { resetOTP: 1, resetOTPExpire: 1 } },
      { new: true }
    ).catch(() => {});
    res.status(500).json({ success: false, message: 'Failed to send OTP. Check your email configuration.' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email,
      resetOTPExpire: { $gt: Date.now() }
    }).select('+resetOTP +resetOTPExpire');

    if (!user) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
    }

    
    const resetToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully!',
      resetToken  
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      email,
      resetOTPExpire: { $gt: Date.now() }
    }).select('+resetOTP +resetOTPExpire +resetOTPAttempts +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;
    user.resetOTPAttempts = 0;
    await user.save();

    
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  college: user.college,
  branch: user.branch,
  year: user.year,
  profilePicture: user.profilePicture,
  cpScore: user.cpScore,
  devScore: user.devScore,
  cpBadge: user.cpBadge,
  devBadge: user.devBadge,
  starRating: user.starRating,
  skills: user.skills,
  interests: user.interests
});

module.exports = { register, login, getMe, forgotPassword, verifyOTP, resetPassword };
