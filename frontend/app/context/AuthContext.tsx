'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '../types';
import api from '../lib/api';

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('admin-token');
      const adminData = localStorage.getItem('admin-data');
      
      if (token && adminData) {
        try {
          const parsedAdmin = JSON.parse(adminData);
          setAdmin(parsedAdmin);
        } catch (error) {
          console.error('Error loading admin data:', error);
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-data');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { username, password });
      
      // Handle both response formats: direct or nested in data
      const token = response.token || response.data?.token;
      const adminData = response.admin || response.data?.admin;
      
      if (response.success && token && adminData) {
        localStorage.setItem('admin-token', token);
        localStorage.setItem('admin-data', JSON.stringify(adminData));
        setAdmin(adminData);
      } else {
        throw new Error(response.error?.message || 'Échec de la connexion');
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(err.message || 'Échec de la connexion');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-data');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
