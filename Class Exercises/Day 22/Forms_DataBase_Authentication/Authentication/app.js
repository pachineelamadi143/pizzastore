const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const app = express();

// ================================
// MIDDLEWARE
// ================================
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ================================
// DUMMY USERS
// ================================
const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, username: 'john',  password: bcrypt.hashSync('john123', 10),  role: 'user'  }
];

console.log('👥 Users loaded:', users.map(u => u.username));

// ================================
// PASSPORT CONFIG
// ================================
passport.use(new LocalStrategy((username, password, done) => {
  console.log('🔍 Login attempt - Username:', username, '| Password:', password);

  const user = users.find(u => u.username === username);
  if (!user) {
    console.log('❌ User not found:', username);
    return done(null, false, { message: 'User not found' });
  }

  console.log('✅ User found:', user.username);

  const match = bcrypt.compareSync(password, user.password);
  console.log('🔐 Password match:', match);

  if (!match) {
    console.log('❌ Wrong password for:', username);
    return done(null, false, { message: 'Wrong password' });
  }

  console.log('🎉 Login successful for:', user.username);
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  console.log('💾 Serializing user:', user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('📂 Deserializing user id:', id);
  const user = users.find(u => u.id === id);
  if (!user) {
    console.log('❌ User not found during deserialization');
    return done(null, false);
  }
  console.log('✅ Deserialized user:', user.username);
  done(null, user);
});

// ================================
// RBAC MIDDLEWARE
// ================================
function isAdmin(req, res, next) {
  console.log('🔒 Checking admin access...');
  console.log('   isAuthenticated:', req.isAuthenticated());
  console.log('   user:', req.user);

  if (req.isAuthenticated() && req.user.role === 'admin') {
    console.log('✅ Admin access granted');
    return next();
  }
  console.log('❌ Access denied');
  res.send(`
    <h2 style="color:red">Access Denied</h2>
    <p>You do not have permission to view this page.</p>
    <a href="/login">Go back to Login</a>
  `);
}

// ================================
// ROUTES
// ================================

// Home
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login Form
app.get('/login', (req, res) => {
  console.log('📄 Login page loaded');
  const errorMsg = req.query.error ? 'Invalid username or password. Please try again.' : '';
  res.send(`
    <h2>Login</h2>
    <p style="color:red">${errorMsg}</p>
    <form action="/login" method="POST">
      <label>Username:</label><br/>
      <input 
        type="text" 
        name="username" 
        placeholder="Enter username" 
        required 
        style="padding:8px; width:200px; margin-bottom:10px;"
      /><br/>
      <label>Password:</label><br/>
      <input 
        type="password" 
        name="password" 
        placeholder="Enter password" 
        required 
        style="padding:8px; width:200px; margin-bottom:10px;"
      /><br/><br/>
      <button 
        type="submit" 
        style="padding:8px 20px; background:blue; color:white; border:none; cursor:pointer;"
      >
        Login
      </button>
    </form>
  `);
});

// Handle Login
app.post('/login', (req, res, next) => {
  console.log('📥 Login POST received');
  console.log('   Body:', req.body);
  next();
}, passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login?error=true'
}));

// Protected Admin Route
app.get('/admin', isAdmin, (req, res) => {
  console.log('🏠 Admin page accessed by:', req.user.username);
  res.send(`
    <h2 style="color:green">Welcome, Admin! 🎉</h2>
    <p>Logged in as: <b>${req.user.username}</b></p>
    <p>Role: <b>${req.user.role}</b></p>
    <br/>
    <a href="/logout" style="color:red;">Logout</a>
  `);
});

// Logout
app.get('/logout', (req, res) => {
  console.log('👋 User logging out:', req.user ? req.user.username : 'unknown');
  req.logout(() => {
    res.redirect('/login');
  });
});

// ================================
// START SERVER
// ================================
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('   Admin → username: admin | password: admin123');
  console.log('   User  → username: john  | password: john123');
  console.log('');
});