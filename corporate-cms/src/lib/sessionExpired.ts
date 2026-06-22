import { saveLastPath } from "@/lib/authSession";

export const SESSION_EXPIRED_EVENT = "auth:sessionExpired";
export const SESSION_RESUMED_EVENT = "auth:sessionResumed";

export class SessionExpiredError extends Error {
  code = "SESSION_EXPIRED";

  constructor(message = "Session expired") {
    super(message);
    this.name = "SessionExpiredError";
  }
}

const getNestedError = (payload: any) => {
  if (payload?.error && typeof payload.error === "object") return payload.error;
  return payload;
};

export const isTokenExpiredPayload = (payload: any) => {
  const error = getNestedError(payload);
  const code = String(error?.code || payload?.code || "").toUpperCase();
  const message = String(error?.message || payload?.message || "").toLowerCase();

  return (
    code === "TOKEN_EXPIRED" ||
    code === "TOKEN_INVALID" ||
    code === "JWT_EXPIRED" ||
    message.includes("token expired") ||
    message.includes("jwt expired") ||
    message.includes("session expired")
  );
};

export const isUnauthorizedOrExpired = (status: number, payload?: any) => {
  return status === 401 || isTokenExpiredPayload(payload);
};

export const isSessionExpiredError = (error: any) => {
  return (
    error instanceof SessionExpiredError ||
    error?.name === "SessionExpiredError" ||
    error?.code === "SESSION_EXPIRED" ||
    error?.code === "TOKEN_EXPIRED" ||
    error?.code === "TOKEN_INVALID" ||
    String(error?.message || "").toLowerCase().includes("session expired")
  );
};

export const createSessionExpiredError = (payload?: any) => {
  const message =
    getNestedError(payload)?.message ||
    payload?.message ||
    "Session expired";
  return new SessionExpiredError(message);
};

export const dispatchSessionExpired = (detail?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  saveLastPath();
  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail,
    })
  );
};

export const dispatchSessionResumed = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SESSION_RESUMED_EVENT));
};
