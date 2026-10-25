const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const foodSpotRoutes = require('./routes/foodSpotRoutes');
const locationRoutes = require('./routes/locationRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes');
const suggestionRoutes = require('./routes/suggestionRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'Accept', 'X-Requested-With']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Server-side Sessions (Module 6 requirement)
app.use(session({
  secret: process.env.SESSION_SECRET || 'vit_campus_food_guide_session_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Defense against XSS cookie theft
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static frontend assets with immediate cache invalidation
app.use(express.static(path.resolve(__dirname, '../client'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Explicit route for Bitewise template preview (Mockup 3)
app.get('/bitewise', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/bitewise.html'));
});

// Serve academic demos statically
app.use('/academic-demos', express.static(path.resolve(__dirname, '../academic-demos')));

// API Routes
app.use('/api/food-spots', foodSpotRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/export', exportRoutes);
app.get('/api/search', require('./controllers/menuItemController').searchDishes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = require('./config/db').getDatabaseStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: '2.0.0',
    system: 'VIT Food Spot Guide'
  });
});

// Single Page Application fallback for client-side routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/academic-demos/')) {
    return res.sendFile(path.resolve(__dirname, '../client/index.html'));
  }
  next();
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
