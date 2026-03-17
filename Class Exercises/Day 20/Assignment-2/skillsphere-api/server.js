const express = require('express');
const app = express();
const PORT = 4000;

// Import courses router
const coursesRouter = require('./routes/courses');

// Challenge 1
app.get('/', (req, res) => {
  res.send('Welcome to SkillSphere LMS API');
});

// Use courses router
app.use('/courses', coursesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});