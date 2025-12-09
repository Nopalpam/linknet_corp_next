import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { accessToken } = response.data.data;

        // Store new access token
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    msg?: string;
    message?: string;
    field?: string;
  }>;
}

// Auth API endpoints
export const authApi = {
  register: (data: RegisterData) => 
    api.post<ApiResponse<{ email: string; name: string }>>('/auth/register', data),
  
  login: (data: LoginData) => 
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  
  logout: (refreshToken: string) => 
    api.post<ApiResponse>('/auth/logout', { refreshToken }),
  
  refreshToken: (refreshToken: string) => 
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),
  
  forgotPassword: (email: string) => 
    api.post<ApiResponse>('/auth/forgot-password', { email }),
  
  resetPassword: (data: ResetPasswordData) => 
    api.post<ApiResponse>('/auth/reset-password', data),
  
  getCurrentUser: () => 
    api.get<ApiResponse<{ user: User }>>('/auth/me')
};

// Type definitions
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
