// Placeholder middleware for future authentication implementation
const isAuthenticated = (req, res, next) => {
  // Currently authentication is disabled, so we'll always allow access
  next();
};

module.exports = {
  isAuthenticated
};