"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";

type User = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  status: string;
  roles: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  permissions: string[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthValidated: boolean; // ✅ NEW: Track if initial validation is complete
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceLogout: () => void; // ✅ NEW: Force logout handler
  // MFA
  mfaPending: boolean;
  mfaTempToken: string | null;
  mfaUserEmail: string | null;
  verifyMfa: (otpToken: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_USER_KEY = "auth_user";
const AUTH_LAST_REFRESH = "auth_last_refresh";

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Sync token between cookie and localStorage
const syncTokens = () => {
  if (typeof window === 'undefined') return;
  
  const cookieToken = getCookie(AUTH_TOKEN_KEY);
  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  
  // If token exists in cookie but not localStorage, sync it
  if (cookieToken && !localToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, cookieToken);
  }
  // If token exists in localStorage but not cookie, sync it
  else if (localToken && !cookieToken) {
    setCookie(AUTH_TOKEN_KEY, localToken, 7);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthValidated, setIsAuthValidated] = useState(false); // ✅ NEW: Track validation state
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaTempToken, setMfaTempToken] = useState<string | null>(null);
  const [mfaUserEmail, setMfaUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isRefreshingRef = useRef(false);
  const forceLogoutRef = useRef(false); // ✅ Prevent multiple logout calls

  // ✅ CRITICAL: Clear auth data helper
  const clearAuthData = useCallback(() => {
    deleteCookie(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_LAST_REFRESH);
  }, []);

  // ✅ CRITICAL: Force logout - clear everything and redirect
  const forceLogout = useCallback(() => {
    if (forceLogoutRef.current) return; // Prevent duplicate calls
    forceLogoutRef.current = true;
    
    console.error('🔴 FORCE LOGOUT: Clearing auth state');
    
    // Save current path for redirect after re-login
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isProtectedPath = currentPath && !currentPath.startsWith('/login') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/reset-password');
    
    clearAuthData();
    setUser(null);
    setIsAuthValidated(true); // Mark as validated (but not authenticated)
    
    // Reset flag after redirect
    setTimeout(() => {
      forceLogoutRef.current = false;
    }, 1000);
    
    // Redirect to login with return URL
    const loginUrl = isProtectedPath ? `/login?from=${encodeURIComponent(currentPath)}` : '/login';
    router.replace(loginUrl);
  }, [router, clearAuthData]);

  // ✅ CRITICAL: Refresh user profile from backend
  const refreshUser = useCallback(async () => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        console.warn('🔴 No token found during refresh - logging out');
        if (!forceLogoutRef.current) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isProtectedPath = currentPath && !currentPath.startsWith('/login');
          clearAuthData();
          setUser(null);
          const loginUrl = isProtectedPath ? `/login?from=${encodeURIComponent(currentPath)}` : '/login';
          router.replace(loginUrl);
        }
        return;
      }

      // Sync tokens between cookie and localStorage
      syncTokens();

      if (AUTH_ENABLED) {
        const profileData = await authService.getProfile();
        console.log('🔵 Profile data received:', profileData);
        
        if (profileData.success && profileData.data.user) {
          const userData = profileData.data.user;
          const updatedUser: User = {
            id: userData.id,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`.trim(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
            status: userData.status,
            roles: userData.roles,
            permissions: userData.permissions,
          };
          console.log('✅ User updated:', updatedUser);
          setUser(updatedUser);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
          localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
        } else {
          console.error('🔴 Profile fetch failed - logging out');
          if (!forceLogoutRef.current) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            const isProtectedPath = currentPath && !currentPath.startsWith('/login');
            clearAuthData();
            setUser(null);
            const loginUrl = isProtectedPath ? `/login?from=${encodeURIComponent(currentPath)}` : '/login';
            router.replace(loginUrl);
          }
        }
      } else {
        // Mock mode: restore from localStorage
        const savedUser = localStorage.getItem(AUTH_USER_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error: any) {
      console.error("🔴 Failed to refresh user:", error);
      
      // ✅ CRITICAL: If error is auth-related or network failure, force logout
      const isAuthError = 
        error?.message?.includes('expired') || 
        error?.message?.includes('Session') ||
        error?.message?.includes('TOKEN_EXPIRED') ||
        error?.message?.includes('TOKEN_INVALID') ||
        error?.response?.status === 401;
      
      const isNetworkError = 
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('terhubung ke server') ||
        error?.message?.includes('NetworkError');

      if (isAuthError || isNetworkError) {
        console.error('🔴 Auth/network error detected - forcing logout');
        if (!forceLogoutRef.current) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isProtectedPath = currentPath && !currentPath.startsWith('/login');
          clearAuthData();
          setUser(null);
          const loginUrl = isProtectedPath ? `/login?from=${encodeURIComponent(currentPath)}` : '/login';
          router.replace(loginUrl);
        }
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [router, clearAuthData]);

  // ✅ Listen for force logout events dispatched from base.service.ts
  useEffect(() => {
    const handleForceLogout = () => {
      console.error('🔴 AuthContext: Received auth:forceLogout event');
      if (forceLogoutRef.current) return;
      forceLogoutRef.current = true;

      clearAuthData();
      setUser(null);
      setIsAuthValidated(true);

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isProtectedPath = currentPath && !currentPath.startsWith('/login') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/reset-password');
      const loginUrl = isProtectedPath ? `/login?from=${encodeURIComponent(currentPath)}` : '/login';
      router.replace(loginUrl);

      setTimeout(() => {
        forceLogoutRef.current = false;
      }, 1000);
    };

    window.addEventListener('auth:forceLogout', handleForceLogout);
    return () => window.removeEventListener('auth:forceLogout', handleForceLogout);
  }, [router, clearAuthData]);

  // ✅ Initialize auth state on mount with BLOCKING validation
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔵 Initializing auth validation...');
      
      try {
        // Sync tokens first
        syncTokens();

        const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
        
        if (!token) {
          console.log('🔴 No token found - user not authenticated');
          setUser(null);
          setIsAuthValidated(true);
          setIsLoading(false);
          return;
        }

        if (AUTH_ENABLED) {
          // ✅ CRITICAL: Validate token with backend BEFORE rendering CMS
          console.log('🔵 Validating token with backend...');
          
          try {
            const profileData = await authService.getProfile();
            console.log('🔵 Initial auth validation - profile data:', profileData);
            
            if (profileData.success && profileData.data.user) {
              const userData = profileData.data.user;
              const validatedUser: User = {
                id: userData.id,
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`.trim(),
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatar: userData.avatar,
                status: userData.status,
                roles: userData.roles,
                permissions: userData.permissions,
              };
              
              console.log('✅ Token validated - user authenticated:', validatedUser);
              setUser(validatedUser);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(validatedUser));
              localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
            } else {
              console.error('🔴 Token validation failed');
              clearAuthData();
              setUser(null);
            }
          } catch (error: any) {
            console.error('🔴 Token validation error:', error);
            // Clear auth data for ALL errors (expired, network, etc.)
            // If we can't validate the token, user should re-login
            clearAuthData();
            setUser(null);
          }
        } else {
          // Mock mode: restore from localStorage
          const savedUser = localStorage.getItem(AUTH_USER_KEY);
          if (savedUser) {
            console.log('✅ Mock mode - user restored from cache');
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        clearAuthData();
        setUser(null);
      } finally {
        setIsAuthValidated(true);
        setIsLoading(false);
        console.log('✅ Auth validation complete');
      }
    };

    initAuth();
  }, [clearAuthData]); // ✅ Stable dependency

  // ✅ CRITICAL: Re-validate auth on route change (TANPA user di dependency untuk cegah loop)
  useEffect(() => {
    // Skip auth pages
    if (pathname?.includes('/login') || pathname?.includes('/register')) return;
    
    // Skip if still loading or not validated yet
    if (isLoading || !isAuthValidated) return;

    // Check if we have a token
    const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      console.warn('🔴 No token on route change');
      return; // Let other logic handle this
    }

    // Debounce: Only refresh if last refresh was > 5 minutes ago
    const lastRefresh = localStorage.getItem(AUTH_LAST_REFRESH);
    if (lastRefresh) {
      const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
      if (timeSinceRefresh < 300000) return; // 5 minutes
    }

    // Sync tokens and silently refresh user profile
    syncTokens();
    refreshUser();
  }, [pathname, isLoading, isAuthValidated, refreshUser]); // ✅ HAPUS user & forceLogout untuk cegah loop

  // ✅ NEW: Periodic token validation (every 10 minutes when tab is active)
  useEffect(() => {
    if (!isAuthValidated || !AUTH_ENABLED) return;

    const interval = setInterval(() => {
      const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.warn('🔴 Token disappeared during periodic check');
        return; // Let other logic handle logout
      }

      // Check last refresh time
      const lastRefresh = localStorage.getItem(AUTH_LAST_REFRESH);
      if (lastRefresh) {
        const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
        // If more than 10 minutes, refresh
        if (timeSinceRefresh > 600000) {
          console.log('🔵 Periodic token validation...');
          refreshUser();
        }
      }
    }, 600000); // Check every 10 minutes

    return () => clearInterval(interval);
  }, [isAuthValidated, refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      if (AUTH_ENABLED) {
        // Real API call to backend
        const response = await authService.login(email, password);

        if (!response.success) {
          throw new Error(response.message || "Login failed");
        }

        // Check if MFA is required
        if (response.data.requiresMfa && response.data.tempToken) {
          setMfaPending(true);
          setMfaTempToken(response.data.tempToken);
          setMfaUserEmail(response.data.user?.email || email);
          // Don't set user or tokens yet - redirect to MFA verify
          router.replace('/mfa-verify');
          return;
        }

        const userData = response.data.user;
        const userForStorage: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: userData.avatar,
          status: userData.status,
          roles: userData.roles || [],
          permissions: userData.permissions || [],
        };

        // Store tokens in both cookie and localStorage
        // Cookie: for middleware access
        // localStorage: for API calls & refresh token
        const accessToken = response.data.accessToken!;
        const refreshToken = response.data.refreshToken!;
        setCookie(AUTH_TOKEN_KEY, accessToken, 7);
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userForStorage));
        
        setUser(userForStorage);

        // Redirect to return URL (from query param) or dashboard
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('from');
        const safeReturnUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login') ? returnUrl : '/';
        router.replace(safeReturnUrl);
      } else {
        // Mock login for development (bypass auth)
        const mockUser: User = {
          id: "mock-user-id",
          email: email,
          name: email.split("@")[0] || "Admin User",
          firstName: email.split("@")[0] || "Admin",
          lastName: "User",
          avatar: null,
          status: "ACTIVE",
          roles: [{ id: "1", name: "Admin", slug: "admin" }],
          permissions: ["*"],
        };

        const mockToken = "mock-token-" + Date.now();

        setCookie(AUTH_TOKEN_KEY, mockToken, 7);
        localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, mockToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
        setUser(mockUser);

        // Redirect to return URL (from query param) or dashboard
        const params = new URLSearchParams(window.location.search);
        const returnUrl = params.get('from');
        const safeReturnUrl = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/login') ? returnUrl : '/';
        router.replace(safeReturnUrl);
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (AUTH_ENABLED) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // Call logout API to invalidate refresh token
          await authService.logout(refreshToken);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      clearAuthData();
      setUser(null);
      setMfaPending(false);
      setMfaTempToken(null);
      setMfaUserEmail(null);
      router.replace("/login");
    }
  };

  // ✅ MFA: Verify OTP after login
  const verifyMfa = async (otpToken: string) => {
    if (!mfaTempToken) {
      throw new Error('No MFA session. Please login again.');
    }

    setIsLoading(true);
    try {
      const response = await authService.mfaVerify(otpToken, mfaTempToken);

      if (!response.success) {
        throw new Error(response.message || 'MFA verification failed');
      }

      const userData = response.data.user;
      const userForStorage: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar,
        status: userData.status,
        roles: userData.roles || [],
        permissions: userData.permissions || [],
      };

      const accessToken = response.data.accessToken!;
      const refreshToken = response.data.refreshToken!;
      setCookie(AUTH_TOKEN_KEY, accessToken, 7);
      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userForStorage));

      setUser(userForStorage);
      setMfaPending(false);
      setMfaTempToken(null);
      setMfaUserEmail(null);

      // Redirect to dashboard
      router.replace('/');
    } catch (error) {
      console.error('MFA verify error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthValidated,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    forceLogout,
    // MFA
    mfaPending,
    mfaTempToken,
    mfaUserEmail,
    verifyMfa,
  };

  // ✅ CRITICAL: Show loading screen while validating auth
  // This prevents CMS from flashing before redirect
  if (!isAuthValidated) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
