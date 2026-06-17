const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://fahad4787.github.io',
  ...(process.env.FRONTEND_URL || '').split(',').map((o) => o.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (/^https:\/\/[\w-]+\.github\.io$/.test(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const professorRoutes = require('./routes/professorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ai', aiRoutes);
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
app.get("/", (req, res) => {
  res.send("EduCore API is running");
});
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different PORT in .env (macOS often reserves 5000 for AirPlay).`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
