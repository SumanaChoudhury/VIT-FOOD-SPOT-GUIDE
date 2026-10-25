const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat requests per minute
  message: {
    success: false,
    error: 'Too many chat requests from this IP. Please wait a minute before asking again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit login attempts
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  chatLimiter,
  authLimiter
};
