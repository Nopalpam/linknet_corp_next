import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

class ApiClientWithRefresh {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable cookies for HttpOnly refresh tokens
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Attach access token to every request
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle 401 and auto-refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (error.response?.data?.code === 'TOKEN_EXPIRED') {
            originalRequest._retry = true;

            if (this.isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              })
                .then(() => {
                  return this.client(originalRequest);
                })
                .catch((err) => {
                  return Promise.reject(err);
                });
            }

            this.isRefreshing = true;

            try {
              // Attempt to refresh the token
              const refreshToken = this.getRefreshToken();
              
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }

              const response = await axios.post(
                `${API_URL}/auth/refresh`,
                { refreshToken },
                { withCredentials: true }
              );

              if (response.data.success && response.data.data) {
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                // Store new tokens
                this.setAccessToken(accessToken);
                this.setRefreshToken(newRefreshToken);

                // Update the authorization header
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                // Process queued requests
                this.processQueue(null);

                // Retry the original request
                return this.client(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - clear tokens and redirect to login
              this.processQueue(refreshError);
              this.clearTokens();
              
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          } else {
            // Other 401 errors (not token expiry) - redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  // Token management methods
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Store in memory or sessionStorage for better security
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Refresh token can be in localStorage or HttpOnly cookie
    return localStorage.getItem('refreshToken');
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    // Store access token in sessionStorage (cleared when browser closes)
    sessionStorage.setItem('accessToken', token);
    // Also store in localStorage as fallback
    localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    // Store refresh token in localStorage
    localStorage.setItem('refreshToken', token);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Public methods
  public setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  public logout(): void {
    this.clearTokens();
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClientWithRefresh();
export default apiClient;
