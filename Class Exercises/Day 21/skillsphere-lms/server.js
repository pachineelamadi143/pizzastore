const express = require('express');
const app = express();

// ✅ Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Points to views folder

// Middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} at ${new Date().toISOString()}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample course data
const courses = [
  { title: 'Node.js Basics',     instructor: 'Alice',   duration: '4 weeks' },
  { title: 'React for Beginners',instructor: 'Bob',     duration: '6 weeks' },
  { title: 'MongoDB Mastery',    instructor: 'Charlie', duration: '3 weeks' },
];

// GET /courses → renders EJS template
app.get('/courses', (req, res) => {
  res.render('courses', { courses }); // Passes data to template
});

// POST /users
app.post('/users', (req, res) => {
  res.json({ message: 'User created successfully', data: req.body });
});

app.listen(3000, () => console.log('Server running on port 3000'));