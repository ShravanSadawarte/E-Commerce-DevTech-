const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow in non-production
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // Allow whitelisted origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app subdomain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting for general API requests
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Serve React build in production (single-server deploy)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  // SPA fallback — serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 Handler (for API only — React fallback above handles frontend)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    errorCode: 'NOT_FOUND',
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
