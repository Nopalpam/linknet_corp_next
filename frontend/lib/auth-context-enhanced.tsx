'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client-enhanced';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  status?: string;
  roles?: string[];
  permissions?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateUser: (user: User) => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProviderEnhanced: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify token is still valid by fetching current user
          try {
            const response = await apiClient.get<{
              success: boolean;
              data?: { user: User };
            }>('/auth/me');
            
            if (response.success && response.data) {
              setUser(response.data.user);
              localStorage.setItem('user', JSON.stringify(response.data.user));
            }
          } catch (error) {
            // Token is invalid - clear storage
            apiClient.logout();
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
      const response = await apiClient.post<{
        success: boolean;
        message?: string;
        data?: {
          user: User;
          accessToken: string;
          refreshToken: string;
        };
      }>('/auth/login', data);
      
      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;
        
        // Store tokens using the enhanced API client
        apiClient.setTokens(accessToken, refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        
        // Redirect to dashboard
        router.push('/cms/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
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
      const response = await apiClient.post<{
        success: boolean;
        message?: string;
      }>('/auth/register', data);
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
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
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and user data
      apiClient.logout();
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    }
  };

  const logoutAll = async () => {
    try {
      await apiClient.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      // Clear tokens and user data
      apiClient.logout();
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    }
  };

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    logoutAll,
    updateUser,
    hasRole,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthEnhanced = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthEnhanced must be used within an AuthProviderEnhanced');
  }
  return context;
};
