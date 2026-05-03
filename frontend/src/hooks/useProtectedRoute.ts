import { useAuth } from "@/context/AuthContext";
import { buildLoginRedirectUrl, clearStoredLastPath, resolvePostLoginPath } from "@/lib/authSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Custom hook to protect routes that require authentication
 * Usage: Add `useProtectedRoute()` at the top of any component that needs authentication
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(buildLoginRedirectUrl());
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};

/**
 * Custom hook to redirect authenticated users away from public pages (e.g., login)
 * Usage: Add `usePublicRoute()` at the top of login/signup pages
 */
export const usePublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnUrl = resolvePostLoginPath();
      clearStoredLastPath();
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};
