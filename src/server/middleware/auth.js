// This middleware is deprecated as we're now using Clerk.com for authentication
// Server-side auth verification should use Clerk's Node SDK instead

const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Use Clerk's middleware for protected routes
const isAuthenticated = ClerkExpressRequireAuth();

module.exports = {
  isAuthenticated
};