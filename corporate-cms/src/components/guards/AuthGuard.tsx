"use client";

import { useAuth } from "@/context/AuthContext";
import { buildLoginRedirectUrl } from "@/lib/authSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard Component
 * 
 * Protects routes by ensuring user is authenticated before rendering children.
 * If not authenticated, shows loading state and redirects to login.
 * 
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <YourProtectedComponent />
 * </AuthGuard>
 * ```
 */
export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isAuthValidated, isLoading, isSessionWarningOpen } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if validation is complete and user is not authenticated
    if (isAuthValidated && !isLoading && !isAuthenticated && !isSessionWarningOpen) {
      console.warn('🔴 AuthGuard: Not authenticated - redirecting to login');
      router.replace(buildLoginRedirectUrl());
    }
  }, [isAuthenticated, isAuthValidated, isLoading, isSessionWarningOpen, router]);

  // Show loading state while validating or loading
  if (!isAuthValidated || isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
