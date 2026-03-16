const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
