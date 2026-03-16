const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('./mailService');

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage || ''
});

const generateToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const assignOtp = async (user, purpose) => {
  const otp = generateOtp();
  user.otpCode = otp;
  user.otpPurpose = purpose;
  user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  await sendOtpEmail({
    to: user.email,
    otp,
    purpose,
    name: user.name
  });
};

const registerUser = async (userData) => {
  const { name, email, password, phone } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if (existingUser) {
    existingUser.name = name;
    existingUser.password = hashedPassword;
    existingUser.phone = phone;
    existingUser.role = 'customer';
    existingUser.isVerified = true;
    existingUser.otpCode = '';
    existingUser.otpPurpose = '';
    existingUser.otpExpiresAt = null;
    await existingUser.save();
  } else {
    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
      isVerified: true
    });
  }

  return { registered: true };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }

  await assignOtp(user, 'login');

  return {
    requiresOtp: true,
    email: user.email
  };
};

const verifyRegisterOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user || user.otpPurpose !== 'register') {
    throw new Error('Invalid OTP request');
  }
  if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
    throw new Error('OTP has expired');
  }
  if (user.otpCode !== otp) {
    throw new Error('Invalid OTP');
  }

  user.isVerified = true;
  user.otpCode = '';
  user.otpPurpose = '';
  user.otpExpiresAt = null;
  await user.save();

  return {
    token: generateToken(user),
    user: serializeUser(user)
  };
};

const verifyLoginOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user || user.otpPurpose !== 'login') {
    throw new Error('Invalid OTP request');
  }
  if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
    throw new Error('OTP has expired');
  }
  if (user.otpCode !== otp) {
    throw new Error('Invalid OTP');
  }

  user.otpCode = '';
  user.otpPurpose = '';
  user.otpExpiresAt = null;
  await user.save();

  return {
    token: generateToken(user),
    user: serializeUser(user)
  };
};

module.exports = { registerUser, loginUser, verifyRegisterOtp, verifyLoginOtp };
