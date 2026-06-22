/**
 * Base Service
 * Provides common functionality for all service classes.
 */

import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dev-be.lncorp.local";
const API_PREFIX = "/api/v1";

const CSRF_TOKEN_KEY = "csrf_token";
const REFRESH_ENDPOINT = `${API_URL}${API_PREFIX}/auth/refresh`;

let refreshSessionPromise: Promise<void> | null = null;

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined") return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
};

const buildAuthHeaders = (headers?: HeadersInit): HeadersInit => {
  const csrfToken = getCookie(CSRF_TOKEN_KEY);

  return {
    "Content-Type": "application/json",
    ...(csrfToken && { "X-CSRF-Token": csrfToken }),
    ...headers,
  };
};

export const refreshAuthSession = async (): Promise<void> => {
  if (!refreshSessionPromise) {
    refreshSessionPromise = (async () => {
      let response: Response;

      try {
        response = await fetch(REFRESH_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: buildAuthHeaders(),
        });
      } catch (networkError) {
        console.error("Network error while refreshing auth session:", networkError);
        throw new Error("Tidak dapat memperpanjang sesi. Periksa koneksi Anda.");
      }

      const data = await response
        .json()
        .catch(() => ({ message: "Token refresh failed" }));

      if (!response.ok || data?.success === false) {
        throw createSessionExpiredError(data);
      }
    })().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
};

export class BaseService {
  protected async fetchWithAuth(url: string, options: RequestInit = {}) {
    const sendRequest = async () =>
      fetch(url, {
        ...options,
        headers: buildAuthHeaders(options.headers),
        credentials: "include",
      });

    let response: Response;
    try {
      response = await sendRequest();
    } catch (networkError) {
      console.error("Network error in fetchWithAuth:", networkError);
      throw new Error("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "An error occurred" }));

      if (isUnauthorizedOrExpired(response.status, errorData)) {
        try {
          await refreshAuthSession();
          response = await sendRequest();
        } catch (refreshError) {
          dispatchSessionExpired({ status: response.status, error: errorData, url });
          throw refreshError instanceof Error
            ? refreshError
            : createSessionExpiredError(errorData);
        }

        if (response.ok) {
          return response.json();
        }

        const retryErrorData = await response
          .json()
          .catch(() => ({ message: "An error occurred" }));

        if (isUnauthorizedOrExpired(response.status, retryErrorData)) {
          dispatchSessionExpired({ status: response.status, error: retryErrorData, url });
          throw createSessionExpiredError(retryErrorData);
        }

        throw new Error(retryErrorData.message || "An error occurred");
      }

      let errorMessage = errorData.message || "An error occurred";

      switch (response.status) {
        case 400:
          errorMessage = errorData.message || "Data yang dikirim tidak valid";
          break;
        case 403:
          errorMessage = "Anda tidak memiliki akses untuk melakukan tindakan ini";
          break;
        case 404:
          errorMessage = errorData.message || "Data tidak ditemukan";
          break;
        case 409:
          errorMessage = errorData.message || "Data sudah ada";
          break;
        case 422:
          errorMessage = errorData.message || "Validasi gagal";
          break;
        case 429:
          errorMessage = "Terlalu banyak permintaan. Silakan coba lagi nanti.";
          break;
        case 500:
          errorMessage = "Terjadi kesalahan server. Silakan coba lagi.";
          break;
        case 503:
          errorMessage = "Layanan sedang tidak tersedia. Silakan coba lagi nanti.";
          break;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  protected getApiUrl(endpoint: string): string {
    return `${API_URL}${API_PREFIX}${endpoint}`;
  }

  protected getToken(): string | null {
    // Tokens are intentionally kept in HttpOnly cookies set by the backend.
    // JavaScript should not read or persist access/refresh tokens.
    return null;
  }
}
