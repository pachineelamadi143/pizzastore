const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(bodyParser.urlencoded({ extended: true }));

// ================================
// MONGODB CONNECTION
// ================================
mongoose.connect('mongodb://localhost:27017/day22db')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// ================================
// USER SCHEMA & MODEL
// ================================
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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

// Handle Form Submission + Save to MongoDB
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    const newUser = new User({ firstName, lastName });
    await newUser.save();

    console.log('✅ User saved to MongoDB:', newUser);
    res.send(`Registration successful for ${firstName} ${lastName}`);
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.send('Registration failed: ' + err.message);
  }
});

// ================================
// START SERVER
// ================================
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});