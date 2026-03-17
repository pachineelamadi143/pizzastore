const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// ✅ RATE LIMITER - 5 requests per minute
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 5,                    // max 5 requests
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  },
});

app.use('/api/', limiter); // apply to all /api/ routes

// In-memory "database"
let courses = [
  { id: 1, name: 'Node.js Basics', duration: '4 weeks' },
  { id: 2, name: 'React Mastery', duration: '6 weeks' },
];
let nextId = 3;

// GET all courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// GET single course
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// POST - create course WITH VALIDATION
app.post(
  '/api/courses',
  [
    body('name').notEmpty().withMessage('Course name is required'),
    body('duration').notEmpty().withMessage('Duration is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, duration } = req.body;
    const newCourse = { id: nextId++, name, duration };
    courses.push(newCourse);
    res.status(201).json(newCourse);
  }
);

// PUT - update course
app.put('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const { name, duration } = req.body;
  course.name = name || course.name;
  course.duration = duration || course.duration;
  res.json(course);
});

// DELETE - remove course
app.delete('/api/courses/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Course not found' });

  courses.splice(index, 1);
  res.json({ message: 'Course deleted successfully' });
});

app.listen(3000, () => console.log('Server running on port 3000'));