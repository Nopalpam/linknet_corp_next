'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook for guest-only routes (login, register, etc.)
 * Redirects to dashboard if user is already authenticated
 */
export const useGuestOnly = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if there's a redirect path stored
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push('/cms/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
};
