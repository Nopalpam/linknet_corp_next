"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingScreen from "@/components/common/LoadingScreen";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const savedUser = localStorage.getItem(AUTH_USER_KEY);

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === "/login";
    const isAuthenticated = !!user;

    // If on login page and already authenticated, redirect to dashboard
    if (isLoginPage && isAuthenticated) {
      router.replace("/");
    }

    // If not on login page and not authenticated, redirect to login
    if (!isLoginPage && !isAuthenticated) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      if (AUTH_ENABLED) {
        // TODO: Replace with actual API call when backend is ready
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ email, password }),
        // });
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.message || "Login failed");
        // localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        // localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        // setUser(data.user);

        throw new Error("Backend authentication not yet implemented");
      } else {
        // Mock login for development (bypass auth)
        const mockUser: User = {
          id: "mock-user-id",
          email: email,
          name: email.split("@")[0] || "Admin User",
        };

        const mockToken = "mock-token-" + Date.now();

        localStorage.setItem(AUTH_TOKEN_KEY, mockToken);
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

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    router.replace("/login");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  // Show loading screen while initializing auth
  if (isLoading) {
    return <LoadingScreen />;
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
