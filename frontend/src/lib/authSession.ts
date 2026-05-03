export const LAST_PATH_KEY = "lastPath";

const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/mfa-verify",
  "/signup",
  "/register",
];

export const getCurrentPath = () => {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
};

export const isSafeReturnPath = (path?: string | null): path is string => {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  return !AUTH_ROUTE_PREFIXES.some((route) => path.startsWith(route));
};

export const getSafeReturnPath = (path?: string | null, fallback = "/") => {
  return isSafeReturnPath(path) ? path : fallback;
};

export const saveLastPath = (path = getCurrentPath()) => {
  if (typeof window === "undefined" || !isSafeReturnPath(path)) return;
  localStorage.setItem(LAST_PATH_KEY, path);
};

export const getStoredLastPath = () => {
  if (typeof window === "undefined") return null;
  const path = localStorage.getItem(LAST_PATH_KEY);
  if (isSafeReturnPath(path)) return path;
  localStorage.removeItem(LAST_PATH_KEY);
  return null;
};

export const clearStoredLastPath = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LAST_PATH_KEY);
};

export const buildLoginRedirectUrl = (reason?: string, path = getCurrentPath()) => {
  const params = new URLSearchParams();
  const from = getSafeReturnPath(path, "");

  if (from) {
    saveLastPath(from);
    params.set("from", from);
  }

  if (reason) {
    params.set("reason", reason);
  }

  const queryString = params.toString();
  return queryString ? `/login?${queryString}` : "/login";
};

export const resolvePostLoginPath = (queryPath?: string | null) => {
  return getSafeReturnPath(queryPath, getStoredLastPath() || "/");
};
