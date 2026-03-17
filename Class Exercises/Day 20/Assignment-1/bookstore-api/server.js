const express = require('express');
const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());

// Challenge 3 - Logger
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${req.method}] ${req.url} - ${time}`);
  next();
});

// Challenge 1
app.get('/', (req, res) => {
  res.send('Welcome to Express Server');
});

app.get('/status', (req, res) => {
  res.json({ server: 'running', uptime: 'OK' });
});

// Challenge 2
app.get('/products', (req, res) => {
  const name = req.query.name;
  if (name) {
    res.send(`Searching for product: ${name}`);
  } else {
    res.send('Please provide a product name');
  }
});

// Challenge 5 - Import books router
const bookRouter = require('./routes/books');
app.use('/books', bookRouter);

// Challenge 5 - 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Challenge 5 BONUS - Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});