
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';
import Spinner from '../components/common/Spinner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = useCallback(async () => {
    if (localStorage.getItem('authToken')) {
      try {
        // This assumes you have an endpoint to get the current user's profile
        // If not, you might need to decode the JWT or store user data in localStorage
        // For simplicity, we'll try to fetch a "me" or "profile" object on load
        // A placeholder user object is created if profile endpoint doesn't exist.
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
           setUser(JSON.parse(storedUser));
        } else {
            // A real app would have a dedicated /api/auth/profile endpoint.
            // We simulate this by re-storing user info on login.
            logout();
        }
      } catch (error) {
        console.error('Failed to fetch user profile, logging out.', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setToken(localStorage.getItem('authToken'));
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.hash = '/login';
  };

  const value = {
    user,
    token,
    isLoading: isLoading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === Role.ADMIN,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
