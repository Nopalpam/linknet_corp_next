"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  buildLoginRedirectUrl,
  clearStoredLastPath,
  isSafeReturnPath,
  resolvePostLoginPath,
  saveLastPath,
} from "@/lib/authSession";
import {
  SESSION_EXPIRED_EVENT,
  dispatchSessionResumed,
  isSessionExpiredError,
} from "@/lib/sessionExpired";

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
  isSessionWarningOpen: boolean;
  login: (email: string, password: string) => Promise<string | undefined>;
  logout: (reason?: string) => Promise<void>;
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
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const SESSION_COUNTDOWN_SECONDS = 15;
const SESSION_WARNING_MS = SESSION_TIMEOUT_MS - SESSION_COUNTDOWN_SECONDS * 1000;
const USER_ACTIVITY_EVENTS = ["click", "keydown", "scroll", "touchstart", "pointerdown"];

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === 'https:' ? ';Secure' : '';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Remove legacy client-side token copies. Backend sessions are carried by
// HttpOnly cookies and CSRF is handled with the readable csrf_token cookie.
const clearLegacyClientTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  const sessionWarningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionCountdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionLogoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSessionWarningOpenRef = useRef(false);
  const [isSessionWarningOpen, setIsSessionWarningOpen] = useState(false);
  const [sessionCountdown, setSessionCountdown] = useState(SESSION_COUNTDOWN_SECONDS);
  const [isExtendingSession, setIsExtendingSession] = useState(false);

  const clearSessionTimers = useCallback(() => {
    if (sessionWarningTimeoutRef.current) {
      clearTimeout(sessionWarningTimeoutRef.current);
      sessionWarningTimeoutRef.current = null;
    }

    if (sessionCountdownIntervalRef.current) {
      clearInterval(sessionCountdownIntervalRef.current);
      sessionCountdownIntervalRef.current = null;
    }

    if (sessionLogoutTimeoutRef.current) {
      clearTimeout(sessionLogoutTimeoutRef.current);
      sessionLogoutTimeoutRef.current = null;
    }
  }, []);

  // ✅ CRITICAL: Clear auth data helper
  const clearAuthData = useCallback(() => {
    deleteCookie(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_LAST_REFRESH);
  }, []);

  const restoreCachedUser = useCallback(() => {
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!savedUser) return false;

    try {
      setUser(JSON.parse(savedUser));
      return true;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return false;
    }
  }, []);

  const triggerSessionWarning = useCallback(() => {
    if (forceLogoutRef.current || isSessionWarningOpenRef.current) return;

    // ✅ FIX: Set ref synchronously BEFORE any state updates.
    // Without this, the activity useEffect re-runs (triggered by restoreCachedUser →
    // setUser) and calls startSessionTimer() → setIsSessionWarningOpen(false),
    // closing the modal immediately before the user ever sees it.
    isSessionWarningOpenRef.current = true;

    saveLastPath();
    clearSessionTimers();
    restoreCachedUser();
    setSessionCountdown(SESSION_COUNTDOWN_SECONDS);
    setIsSessionWarningOpen(true);
    setIsAuthValidated(true);
    setIsLoading(false);
  }, [clearSessionTimers, restoreCachedUser]);

  // ✅ CRITICAL: Force logout - clear everything and redirect
  const forceLogout = useCallback(() => {
    if (forceLogoutRef.current) return; // Prevent duplicate calls
    forceLogoutRef.current = true;
    
    console.error('🔴 FORCE LOGOUT: Clearing auth state');
    
    const loginUrl = buildLoginRedirectUrl('session_expired');
    clearSessionTimers();
    setIsSessionWarningOpen(false);
    clearAuthData();
    setUser(null);
    setIsAuthValidated(true); // Mark as validated (but not authenticated)
    
    // Reset flag after redirect
    setTimeout(() => {
      forceLogoutRef.current = false;
    }, 1000);
    
    // Redirect to login with session_expired reason
    router.replace(loginUrl);
  }, [router, clearAuthData, clearSessionTimers]);

  // ✅ CRITICAL: Refresh user profile from backend
  const refreshUser = useCallback(async () => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current) return;
    
    try {
      isRefreshingRef.current = true;
      clearLegacyClientTokens();
      
      // Legacy localStorage tokens were cleared above; backend cookies carry the session.

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
            clearAuthData();
            setUser(null);
            router.replace(buildLoginRedirectUrl('session_expired'));
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
      if (isSessionExpiredError(error)) {
        triggerSessionWarning();
        return;
      }

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
        console.error('Auth/network error detected - showing session warning');
        triggerSessionWarning();
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [router, clearAuthData, triggerSessionWarning]);

  // ✅ Listen for force logout events dispatched from base.service.ts
  useEffect(() => {
    const handleForceLogout = () => {
      console.error('🔴 AuthContext: Received auth:forceLogout event');
      if (forceLogoutRef.current) return;
      forceLogoutRef.current = true;

      clearSessionTimers();
      setIsSessionWarningOpen(false);
      clearAuthData();
      setUser(null);
      setIsAuthValidated(true);

      router.replace(buildLoginRedirectUrl('session_expired'));

      setTimeout(() => {
        forceLogoutRef.current = false;
      }, 1000);
    };

    window.addEventListener('auth:forceLogout', handleForceLogout);
    return () => window.removeEventListener('auth:forceLogout', handleForceLogout);
  }, [router, clearAuthData, clearSessionTimers]);

  // ✅ Initialize auth state on mount with BLOCKING validation
  useEffect(() => {
    const handleSessionExpired = () => {
      triggerSessionWarning();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isSessionExpiredError(event.reason)) return;
      event.preventDefault();
      triggerSessionWarning();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    const initAuth = async () => {
      console.log('🔵 Initializing auth validation...');
      
      try {
        clearLegacyClientTokens();

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

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [clearAuthData, triggerSessionWarning]); // ✅ Stable dependency

  // ✅ CRITICAL: Re-validate auth on route change (TANPA user di dependency untuk cegah loop)
  useEffect(() => {
    // Skip auth pages
    if (pathname?.includes('/login') || pathname?.includes('/register')) return;
    
    // Skip if still loading or not validated yet
    if (isLoading || !isAuthValidated) return;

    // Debounce: Only refresh if last refresh was > 5 minutes ago
    const lastRefresh = localStorage.getItem(AUTH_LAST_REFRESH);
    if (lastRefresh) {
      const timeSinceRefresh = Date.now() - parseInt(lastRefresh);
      if (timeSinceRefresh < 300000) return; // 5 minutes
    }

    // Silently refresh user profile using HttpOnly cookie session.
    refreshUser();
  }, [pathname, isLoading, isAuthValidated, refreshUser]); // ✅ HAPUS user & forceLogout untuk cegah loop

  // ✅ NEW: Periodic token validation (every 10 minutes when tab is active)
  useEffect(() => {
    if (!isAuthValidated || !AUTH_ENABLED) return;

    const interval = setInterval(() => {
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
          const params = new URLSearchParams(window.location.search);
          const returnUrl = resolvePostLoginPath(params.get('from'));
          saveLastPath(returnUrl);
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

        // Backend sets HttpOnly cookies for the browser session.
        clearLegacyClientTokens();
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userForStorage));
        localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
        
        setUser(userForStorage);
        // ✅ Reset session-expired suppression so error toasts work after re-login
        dispatchSessionResumed();

        // Redirect to return URL (from query param) or dashboard
        const params = new URLSearchParams(window.location.search);
        const safeReturnUrl = resolvePostLoginPath(params.get('from'));
        clearStoredLastPath();
        router.replace(safeReturnUrl);
        return response.data.securityNotice;
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
        // ✅ Reset session-expired suppression so error toasts work after re-login
        dispatchSessionResumed();
        localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
        setUser(mockUser);

        // Redirect to return URL (from query param) or dashboard
        const params = new URLSearchParams(window.location.search);
        const safeReturnUrl = resolvePostLoginPath(params.get('from'));
        clearStoredLastPath();
        router.replace(safeReturnUrl);
        return "Authorized use only. All activity is monitored and logged by PT Link Net Tbk.";
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (reason?: string) => {
    if (forceLogoutRef.current) return;
    forceLogoutRef.current = true;

    const loginUrl = buildLoginRedirectUrl(reason);
    clearSessionTimers();
    setIsSessionWarningOpen(false);

    try {
      if (AUTH_ENABLED) {
        await authService.logout();
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
      router.replace(loginUrl);

      setTimeout(() => {
        forceLogoutRef.current = false;
      }, 1000);
    }
  }, [clearAuthData, clearSessionTimers, router]);

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

      clearLegacyClientTokens();
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userForStorage));
      localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());

      setUser(userForStorage);
      setMfaPending(false);
      setMfaTempToken(null);
      setMfaUserEmail(null);

      const returnUrl = resolvePostLoginPath();
      clearStoredLastPath();
      router.replace(returnUrl);
    } catch (error) {
      console.error('MFA verify error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startSessionTimer = useCallback(() => {
    clearSessionTimers();
    isSessionWarningOpenRef.current = false;
    setIsSessionWarningOpen(false);
    setSessionCountdown(SESSION_COUNTDOWN_SECONDS);

    sessionWarningTimeoutRef.current = setTimeout(() => {
      if (forceLogoutRef.current || isSessionWarningOpenRef.current) return;
      setSessionCountdown(SESSION_COUNTDOWN_SECONDS);
      setIsSessionWarningOpen(true);
    }, SESSION_WARNING_MS);
  }, [clearSessionTimers]);

  const handleContinueSession = useCallback(async () => {
    if (isExtendingSession) return;

    setIsExtendingSession(true);
    try {
      if (AUTH_ENABLED) {
        const response = await authService.refreshToken();
        if (!response.success) {
          throw new Error('Gagal memperpanjang sesi');
        }

        clearLegacyClientTokens();
        await refreshUser();
      }

      localStorage.setItem(AUTH_LAST_REFRESH, Date.now().toString());
      dispatchSessionResumed();
      startSessionTimer();
    } catch (error) {
      console.error("Failed to extend session:", error);
      forceLogout();
    } finally {
      setIsExtendingSession(false);
    }
  }, [forceLogout, isExtendingSession, refreshUser, startSessionTimer]);

  useEffect(() => {
    isSessionWarningOpenRef.current = isSessionWarningOpen;
  }, [isSessionWarningOpen]);

  useEffect(() => {
    const currentPath = pathname || "/";
    if (!isAuthValidated || !user || !isSafeReturnPath(currentPath)) {
      clearSessionTimers();
      setIsSessionWarningOpen(false);
      return;
    }

    const handleUserActivity = () => {
      if (forceLogoutRef.current || isSessionWarningOpenRef.current) return;
      startSessionTimer();
    };

    // ✅ FIX: Only start the session timer if the warning modal is NOT already open.
    // When triggerSessionWarning() calls restoreCachedUser() → setUser(), this effect
    // re-runs (user is a dependency). Without this guard, startSessionTimer() would
    // call setIsSessionWarningOpen(false), closing the modal immediately.
    if (!isSessionWarningOpenRef.current) {
      startSessionTimer();
    }
    USER_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true });
    });

    return () => {
      USER_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity);
      });
      clearSessionTimers();
    };
  }, [clearSessionTimers, isAuthValidated, pathname, startSessionTimer, user]);

  useEffect(() => {
    if (!isSessionWarningOpen) return;

    setSessionCountdown(SESSION_COUNTDOWN_SECONDS);
    sessionCountdownIntervalRef.current = setInterval(() => {
      setSessionCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    sessionLogoutTimeoutRef.current = setTimeout(() => {
      void logout('session_expired');
    }, SESSION_COUNTDOWN_SECONDS * 1000);

    return () => {
      if (sessionCountdownIntervalRef.current) {
        clearInterval(sessionCountdownIntervalRef.current);
        sessionCountdownIntervalRef.current = null;
      }

      if (sessionLogoutTimeoutRef.current) {
        clearTimeout(sessionLogoutTimeoutRef.current);
        sessionLogoutTimeoutRef.current = null;
      }
    };
  }, [isSessionWarningOpen, logout]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthValidated,
    isAuthenticated: !!user,
    isSessionWarningOpen,
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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isSessionWarningOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-gray-950/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-expiry-title"
            className="w-full max-w-md rounded-lg border border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-900/60 dark:bg-gray-900"
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.88c.673 1.166-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.459-1.516-2.625l6.28-10.88ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 id="session-expiry-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sesi hampir berakhir
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Sesi Anda telah melebihi batas 15 menit. Apakah Anda ingin melanjutkan sesi?
                </p>
                <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-300" aria-live="polite">
                  Logout dalam {sessionCountdown} detik...
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => void logout('session_expired')}
                disabled={isExtendingSession}
                className="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Tidak
              </button>
              <button
                type="button"
                onClick={() => void handleContinueSession()}
                disabled={isExtendingSession}
                className="inline-flex justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExtendingSession ? "Memperpanjang sesi..." : "Ya, lanjutkan sesi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
