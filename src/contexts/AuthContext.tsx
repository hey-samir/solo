import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  profilePhoto?: string;
  memberSince: Date;
}

interface UpdateProfileData {
  username?: string;
  profilePhoto?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Development demo user matching our seeded data
const demoUser = {
  id: 4, // From our SQL query
  username: 'gosolonyc',
  email: 'demo@soloapp.dev',
  memberSince: new Date(),
  profilePhoto: 'gray'
};

// Toggle this flag to enable/disable authentication
const BYPASS_AUTH = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH);
  const [user, setUser] = useState<User | null>(BYPASS_AUTH ? demoUser : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  useEffect(() => {
    const checkAuth = async () => {
      if (BYPASS_AUTH) {
        setIsAuthenticated(true);
        setUser(demoUser);
        setLoading(false);
        return;
      }

      try {
        const response = await client.get('/auth/current-user');
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const updateUserProfile = async (data: UpdateProfileData) => {
    if (BYPASS_AUTH) {
      setUser(prev => prev ? { ...prev, ...data } : null);
      return;
    }

    try {
      const response = await client.put('/api/users/profile', data);
      if (response.data) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (BYPASS_AUTH) {
      console.log('Logout bypassed in development mode');
      return;
    }

    try {
      await client.get('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};