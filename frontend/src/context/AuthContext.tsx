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
  const router = useRouter();
  const pathname = usePathname();
  const isRefreshingRef = useRef(false);

  // ✅ CRITICAL: Force logout - clear everything and redirect
  const forceLogout = useCallback(() => {
    console.error('🔴 FORCE LOGOUT: Clearing auth state');
    clearAuthData();
    setUser(null);
    setIsAuthValidated(true); // Mark as validated (but not authenticated)
    router.replace('/login');
  }, [router]);

  // ✅ CRITICAL: Refresh user profile from backend
  const refreshUser = useCallback(async () => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
      
      if (!token) {
        console.warn('🔴 No token found during refresh - logging out');
        forceLogout();
        return;
      }

      // Sync tokens between cookie and localStorage
      syncTokens();

      if (AUTH_ENABLED) {
        const profileData = await authService.getProfile();
        if (profileData.success) {
          const updatedUser: User = {
            id: profileData.data.id,
            email: profileData.data.email,
            name: `${profileData.data.firstName} ${profileData.data.lastName}`.trim(),
            firstName: profileData.data.firstName,
            lastName: profileData.data.lastName,
            avatar: profileData.data.avatar,
            status: profileData.data.status,
            roles: profileData.data.roles,
            permissions: profileData.data.permissions,
          };
          setUser(updatedUser);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
          localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
        } else {
          console.error('🔴 Profile fetch failed - logging out');
          forceLogout();
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
      
      // ✅ CRITICAL: If error contains TOKEN_EXPIRED or is auth-related, force logout
      if (
        error?.message?.includes('expired') || 
        error?.message?.includes('Session') ||
        error?.message?.includes('TOKEN_EXPIRED') ||
        error?.message?.includes('TOKEN_INVALID') ||
        error?.response?.status === 401
      ) {
        console.error('🔴 Auth error detected - forcing logout');
        forceLogout();
      }
      // Don't clear auth on other errors - token might still be valid
    } finally {
      isRefreshingRef.current = false;
    }
  }, [forceLogout]);

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
            
            if (profileData.success) {
              const validatedUser: User = {
                id: profileData.data.id,
                email: profileData.data.email,
                name: `${profileData.data.firstName} ${profileData.data.lastName}`.trim(),
                firstName: profileData.data.firstName,
                lastName: profileData.data.lastName,
                avatar: profileData.data.avatar,
                status: profileData.data.status,
                roles: profileData.data.roles,
                permissions: profileData.data.permissions,
              };
              
              console.log('✅ Token validated - user authenticated');
              setUser(validatedUser);
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(validatedUser));
              localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
            } else {
              console.error('🔴 Token validation failed');
              forceLogout();
            }
          } catch (error: any) {
            console.error('🔴 Token validation error:', error);
            
            // If error is auth-related, force logout
            if (error?.message?.includes('expired') || error?.message?.includes('Session')) {
              forceLogout();
            } else {
              // For other errors, still mark as validated but clear user
              setUser(null);
            }
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
        setUser(null);
      } finally {
        setIsAuthValidated(true);
        setIsLoading(false);
        console.log('✅ Auth validation complete');
      }
    };

    initAuth();
  }, [forceLogout]); // ✅ Include forceLogout dependency

  // ✅ CRITICAL: Re-validate auth on route change
  useEffect(() => {
    // Skip if not authenticated or still loading
    if (!user || isLoading) return;
    
    // Skip auth pages
    if (pathname?.includes('/login') || pathname?.includes('/register')) return;

    // Debounce: Only refresh if last refresh was > 5 minutes ago
    const lastRefresh = localStorage.getItem(AUTH_LAST_REFRESH);
    if (lastRefresh) {
      const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
      if (timeSinceRefresh < 300000) return; // 5 minutes
    }

    // Sync tokens and verify user is still valid
    syncTokens();
    
    // Check if token still exists
    const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      console.warn('🔴 Token missing after navigation - logging out');
      forceLogout();
      return;
    }

    // Silently refresh user profile
    refreshUser();
  }, [pathname, user, isLoading, refreshUser, forceLogout]); // ✅ Re-run on route change

  // ✅ NEW: Periodic token validation (every 10 minutes when tab is active)
  useEffect(() => {
    if (!user || !AUTH_ENABLED) return;

    const interval = setInterval(() => {
      const token = getCookie(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        console.warn('🔴 Token disappeared - logging out');
        forceLogout();
        return;
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
  }, [user, refreshUser, forceLogout]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      if (AUTH_ENABLED) {
        // Real API call to backend
        const response = await authService.login(email, password);

        if (!response.success) {
          throw new Error(response.message || "Login failed");
        }

        const userData = response.data.user;
        const userForStorage: User = {
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

        // Store tokens in both cookie and localStorage
        // Cookie: for middleware access
        // localStorage: for API calls & refresh token
        setCookie(AUTH_TOKEN_KEY, response.data.accessToken, 7);
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userForStorage));
        
        setUser(userForStorage);

        // Redirect to dashboard
        router.replace("/");
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

        // Redirect to dashboard
        router.replace("/");
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
      router.replace("/login");
    }
  };

  const clearAuthData = () => {
    deleteCookie(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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
