type CmsUser = {
  roles?: Array<{ slug: string }>;
  permissions?: string[];
};

type CmsRouteAccess = {
  path: string;
  permissions: string[];
  exact?: boolean;
};

export const CMS_ROUTE_ACCESS: CmsRouteAccess[] = [
  { path: "/", permissions: ["dashboard.read"], exact: true },
  { path: "/pages", permissions: ["pages.read"] },
  { path: "/awards", permissions: ["awards.read"] },
  { path: "/solutions", permissions: ["solutions.read"] },
  { path: "/management", permissions: ["management.read"] },
  { path: "/map-coverage", permissions: ["map_coverage.read"] },
  { path: "/reports", permissions: ["reports.read"] },
  { path: "/announcements", permissions: ["announcements.read"] },
  { path: "/news", permissions: ["news.read"] },
  { path: "/events", permissions: ["events.read"] },
  { path: "/careers", permissions: ["careers.read"] },
  { path: "/contact-data-bank", permissions: ["contact_submissions.read"] },
  { path: "/form-modules", permissions: ["form_modules.read"] },
  { path: "/form-submissions", permissions: ["form_submissions.read"] },
  { path: "/cookie-consents", permissions: ["cookie_consents.read"] },
  { path: "/users-management", permissions: ["users_management.read"] },
  { path: "/roles-permissions", permissions: ["role_management.read"] },
  { path: "/file-manager", permissions: ["files.read"] },
  { path: "/component-visibility", permissions: ["component_visibility.read"] },
  { path: "/data/label", permissions: ["labels.read"] },
  { path: "/log-activity", permissions: ["log_activity.read"] },
  { path: "/settings", permissions: ["settings.read"] },
  { path: "/url-redirection", permissions: ["url_redirection.read"] },
  { path: "/menu-management", permissions: ["menu_management.read"] },
];

const ALWAYS_ALLOWED_PATHS = ["/profile", "/mfa-setup"];

const normalizePath = (pathname: string) => {
  const cleanPath = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  return cleanPath.length > 0 ? cleanPath : "/";
};

const isPrivilegedUser = (user: CmsUser | null) => {
  if (!user) return false;
  if (user.permissions?.includes("*")) return true;
  return user.roles?.some((role) => role.slug === "super-admin" || role.slug === "super_admin") ?? false;
};

export const getRequiredPermissionsForPath = (pathname: string): string[] | null => {
  const normalizedPath = normalizePath(pathname);

  if (ALWAYS_ALLOWED_PATHS.some((path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`))) {
    return [];
  }

  const routeAccess = CMS_ROUTE_ACCESS.find((route) => {
    if (route.exact) return normalizedPath === route.path;
    return normalizedPath === route.path || normalizedPath.startsWith(`${route.path}/`);
  });

  return routeAccess?.permissions ?? null;
};

export const canAccessCmsPath = (user: CmsUser | null, pathname: string) => {
  const requiredPermissions = getRequiredPermissionsForPath(pathname);
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  if (isPrivilegedUser(user)) return true;

  const userPermissions = new Set(user?.permissions || []);
  return requiredPermissions.some((permission) => userPermissions.has(permission));
};

export const getFirstAccessibleCmsPath = (user: CmsUser | null) => {
  if (canAccessCmsPath(user, "/")) return "/";

  const firstAllowedRoute = CMS_ROUTE_ACCESS.find((route) => canAccessCmsPath(user, route.path));
  return firstAllowedRoute?.path || "/profile";
};
