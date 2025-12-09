'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User, LoginData, RegisterData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching current user
          try {
            const response = await authApi.getCurrentUser();
            if (response.data.success && response.data.data) {
              setUser(response.data.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
          } catch (error) {
            // Token is invalid - clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      
      if (response.data.success && response.data.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Redirect to dashboard
        router.push('/cms/dashboard');
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred during login');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
      
      // Registration successful - user will need to verify email
      // Don't auto-login
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An error occurred during registration');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
