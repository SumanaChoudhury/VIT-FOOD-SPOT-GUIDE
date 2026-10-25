const crypto = require('crypto');

// In-memory token store for administrator authentication (fallback & cross-origin safety)
const activeAdminTokens = new Map();

function createAdminToken(adminData) {
  const token = 'vit_adm_' + crypto.randomBytes(24).toString('hex');
  activeAdminTokens.set(token, {
    ...adminData,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return token;
}

function verifyAdminToken(token) {
  if (!token) return null;
  const session = activeAdminTokens.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    activeAdminTokens.delete(token);
    return null;
  }
  return session;
}

function revokeAdminToken(token) {
  if (token) {
    activeAdminTokens.delete(token);
  }
}

function requireAdminAuth(req, res, next) {
  // 1. Check server-side session cookie first
  if (req.session && req.session.admin) {
    return next();
  }

  // 2. Check token header (x-admin-token or Authorization Bearer)
  const token = req.headers['x-admin-token'] || 
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));

  if (token) {
    const admin = verifyAdminToken(token);
    if (admin) {
      if (!req.session) req.session = {};
      req.session.admin = admin;
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Administrator authentication required.',
    authenticated: false
  });
}

module.exports = {
  requireAdminAuth,
  createAdminToken,
  verifyAdminToken,
  revokeAdminToken
};
