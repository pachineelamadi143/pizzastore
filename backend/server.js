const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initWebSocket } = require('./services/websocketService');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

// Create express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Pizza Store API is running!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/menu', require('./routes/menuItemRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/address', require('./routes/addressRoutes'));

// Create HTTP server and attach WebSocket server

const server = http.createServer(app);

const wss = new WebSocketServer({ server });
initWebSocket(wss);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);;
});