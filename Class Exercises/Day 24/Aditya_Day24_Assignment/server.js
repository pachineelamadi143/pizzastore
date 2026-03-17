const express = require('express');
const multer = require('multer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);   // wrap express with http
const io = new Server(server);           // attach socket.io

// Serve static files from /public (for our chat HTML page)
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/materials', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const fileFilter = (req, file, cb) => {
  file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDFs only'));
};
const upload = multer({ storage, fileFilter });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send(`File uploaded successfully: ${req.file.originalname}`);
});

// ✅ Challenge 3: Socket.io Real-Time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for incoming messages
  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg);   // broadcast to ALL connected users
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Use server.listen (not app.listen) for socket.io to work
server.listen(3000, () => console.log('Server running on port 3000'));