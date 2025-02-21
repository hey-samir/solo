// This context is deprecated as we're now using Clerk.com for authentication
// This file can be safely deleted as it's no longer needed

import { createContext } from 'react';

// Keeping this as a placeholder until all components are migrated to use Clerk
const AuthContext = createContext(null);

export const useAuth = () => {
  console.warn('useAuth is deprecated. Please use Clerk hooks instead.');
  return null;
};