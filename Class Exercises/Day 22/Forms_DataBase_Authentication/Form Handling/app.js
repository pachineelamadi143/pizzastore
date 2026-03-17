const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(bodyParser.urlencoded({ extended: true }));

// ================================
// ROUTES
// ================================

// Home
app.get('/', (req, res) => {
  res.redirect('/register');
});

// Show Registration Form
app.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form action="/register" method="POST">
      <input type="text" name="firstName" placeholder="First Name" required /><br/><br/>
      <input type="text" name="lastName" placeholder="Last Name" required /><br/><br/>
      <button type="submit">Register</button>
    </form>
  `);
});

// Handle Form Submission
app.post('/register', (req, res) => {
  const { firstName, lastName } = req.body;
  res.send(`Registration successful for ${firstName} ${lastName}`);
});

// ================================
// START SERVER
// ================================
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});