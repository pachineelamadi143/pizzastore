// routes/courses.js
const express = require('express');
const router = express.Router();

// Middleware
const validateCourseId = (req, res, next) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid course ID' });
  }
  next();
};

// Route
router.get('/:id', validateCourseId, (req, res) => {
  res.json({
    id: req.params.id,
    name: 'React Mastery',
    duration: '6 weeks'
  });
});

module.exports = router;