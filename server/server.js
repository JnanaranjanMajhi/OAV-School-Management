require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const cookieParser = require('cookie-parser');

const app = express();

// ─── Trust Proxy ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('combined'));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 auth attempts per 15 min per IP (brute-force protection)
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/', limiter);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// ─── Static Files (uploads) ──────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/school-info', require('./routes/schoolInfo'));
app.use('/api/events', require('./routes/events'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/results', require('./routes/results'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/online-classes', require('./routes/onlineClasses'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/logs', require('./routes/logs'));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ success: true, message: 'Server is running', timestamp: new Date() }));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Database Connection & Server Start ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
