function requireAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Unauthorized: Administrator authentication required.',
    authenticated: false
  });
}

module.exports = {
  requireAdminAuth
};
