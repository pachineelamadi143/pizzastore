const { registerUser, loginUser, verifyRegisterOtp, verifyLoginOtp } = require('../services/authService');

// REGISTER
const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      message: 'OTP sent to your email',
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json({
      message: 'OTP sent to your email',
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyRegisterOtp(email, otp);
    res.status(200).json({
      message: 'Registration verified successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyLoginOtp(email, otp);
    res.status(200).json({
      message: 'Login verified successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { register, login, verifyRegister, verifyLogin, logout };
