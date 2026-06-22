"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildLoginRedirectUrl } from "@/lib/authSession";
import { canAccessCmsPath, getFirstAccessibleCmsPath } from "@/lib/cmsAccess";
import { useToast } from "@/context/ToastContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, isAuthenticated, isAuthValidated, isLoading, isSessionWarningOpen } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const deniedPathRef = useRef<string | null>(null);
  const hasPageAccess = useMemo(
    () => canAccessCmsPath(user, pathname || "/"),
    [pathname, user]
  );
  const fallbackPath = useMemo(() => getFirstAccessibleCmsPath(user), [user]);

  // ✅ CRITICAL: Block rendering if not authenticated
  useEffect(() => {
    if (isAuthValidated && !isLoading && !isAuthenticated && !isSessionWarningOpen) {
      console.warn('🔴 Not authenticated - redirecting to login');
      router.replace(buildLoginRedirectUrl());
    }
  }, [isAuthenticated, isAuthValidated, isLoading, isSessionWarningOpen, router]);

  useEffect(() => {
    if (!isAuthValidated || isLoading || !isAuthenticated || hasPageAccess) {
      return;
    }

    if (deniedPathRef.current !== pathname) {
      toast.error("Anda tidak memiliki akses ke halaman tersebut");
      deniedPathRef.current = pathname || null;
    }

    router.replace(fallbackPath);
  }, [
    fallbackPath,
    hasPageAccess,
    isAuthenticated,
    isAuthValidated,
    isLoading,
    pathname,
    router,
    toast,
  ]);

  // ✅ CRITICAL: Don't render CMS if not authenticated
  if (!isAuthValidated || isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasPageAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
