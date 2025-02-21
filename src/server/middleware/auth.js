const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Configure Clerk middleware
const requireAuth = ClerkExpressRequireAuth({
  // Optional: Configure custom handling for auth
  onError: (err, req, res, next) => {
    console.error('[Auth Middleware] Clerk authentication error:', err);
    res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please sign in to access this resource'
    });
  }
});

// Define role-based middleware
const requireAdmin = (req, res, next) => {
  const { auth } = req;

  if (!auth?.sessionClaims?.metadata?.role === 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};