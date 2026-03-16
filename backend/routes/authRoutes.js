const express = require('express');
const router = express.Router();
const { register, login, verifyRegister, verifyLogin, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/register/verify', verifyRegister);
router.post('/login', login);
router.post('/login/verify', verifyLogin);

// Protected route
router.post('/logout', protect, logout);

module.exports = router;
