import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  profilePhoto?: string;
  memberSince: Date;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Development mock user
const mockUser = {
  id: 1,
  username: 'DemoUser',
  email: 'demo@example.com',
  memberSince: new Date(),
  profilePhoto: null
};

// Toggle this flag to enable/disable authentication
const BYPASS_AUTH = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH);
  const [user, setUser] = useState<User | null>(BYPASS_AUTH ? mockUser : null);
  const [loading, setLoading] = useState(!BYPASS_AUTH);

  useEffect(() => {
    const checkAuth = async () => {
      if (BYPASS_AUTH) {
        setIsAuthenticated(true);
        setUser(mockUser);
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
    <AuthContext.Provider value={{ isAuthenticated, user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};