/**
 * File Manager Service
 * Browser-facing client for the corporate-be media gateway.
 *
 * Flow: corporate-cms -> corporate-be /api/v1/media -> corporate-fm -> S3.
 * The corporate-fm API key stays server-side in corporate-be.
 */

import { getApiV1BaseUrl } from "@/lib/apiConfig";
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";
import { refreshAuthSession } from "./base.service";

export type FileItem = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string | null;
  thumbnails?: {
    small?: string;
    medium?: string;
    large?: string;
  } | null;
  width?: number | null;
  height?: number | null;
  downloads: number;
  isPublic: boolean;
  cloudProvider?: string | null;
  cloudKey?: string | null;
  cloudPath?: string | null;
  source?: "database" | "s3";
  createdAt: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  folder?: {
    id: string;
    name: string;
    path: string;
  } | null;
};

export type MediaFolder = {
  id: string;
  name: string;
  path: string;
  parentId?: string | null;
  fileCount?: number;
  childCount?: number;
  createdAt: string;
  updatedAt: string;
  children?: MediaFolder[];
};

export type FileListResponse = {
  success: boolean;
  requestId?: string;
  data: {
    files: FileItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    storage?: {
      internalService: string;
      provider: string;
      prefix: string;
      objectCountFromS3List: number;
      s3OnlyObjectCount?: number;
      sampleKeys: string[];
    };
  };
};

export type FileUploadResponse = {
  success: boolean;
  message: string;
  requestId?: string;
  data: {
    files: FileItem[];
    totalUploaded: number;
    totalRequested: number;
  };
};

export type FileDetailResponse = {
  success: boolean;
  requestId?: string;
  data: {
    file: FileItem;
  };
};

export type FolderListResponse = {
  success: boolean;
  requestId?: string;
  data: {
    items: MediaFolder[];
  };
};

export type FolderMutationResponse = {
  success: boolean;
  message: string;
  requestId?: string;
  data: {
    folder: MediaFolder;
  };
};

export type FileMutationResponse = {
  success: boolean;
  message: string;
  requestId?: string;
  data: { file: FileItem };
};

export type FileManagerDebugResponse = {
  success: boolean;
  requestId?: string;
  data: Record<string, unknown>;
};

type FileManagerErrorSource =
  | "cms-api-client"
  | "corporate-be"
  | "corporate-fm"
  | "aws-s3"
  | "cors"
  | "network"
  | "routing"
  | "auth"
  | "validation";

type ApiPayload = {
  success?: boolean;
  message?: string;
  code?: string;
  error?: string | { code?: string; message?: string };
  requestId?: string;
  details?: {
    source?: string;
    code?: string;
    statusCode?: number;
    routePath?: string;
    requestId?: string;
    likelyCause?: string;
    details?: {
      diagnostic?: {
        source?: string;
        code?: string;
        message?: string;
        likelyCause?: string;
        awsRequestId?: string;
      };
    } | null;
  };
};

export class FileManagerApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly source: FileManagerErrorSource;
  readonly endpoint: string;
  readonly requestId?: string;
  readonly likelyCause?: string;
  readonly details?: unknown;

  constructor(message: string, options: {
    status?: number;
    code?: string;
    source: FileManagerErrorSource;
    endpoint: string;
    requestId?: string;
    likelyCause?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = "FileManagerApiError";
    this.status = options.status;
    this.code = options.code;
    this.source = options.source;
    this.endpoint = options.endpoint;
    this.requestId = options.requestId;
    this.likelyCause = options.likelyCause;
    this.details = options.details;
  }
}

export const serviceFallbackUrls = {
  corporateBe: "https://dev-be.lncorp.local",
  corporateCms: "https://dev-cms.lncorp.local",
  corporateFm: "https://dev-fm.lncorp.local",
  corporateWeb: "https://dev.linknet.co.id",
};

const CSRF_TOKEN_KEY = "csrf_token";
const isFileManagerDebugEnabled = (): boolean => (
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_APP_ENV === "staging" ||
  process.env.NEXT_PUBLIC_FILE_MANAGER_DEBUG === "true"
);

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEq = `${name}=`;

  for (const cookie of document.cookie.split(";")) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(nameEq)) {
      return trimmed.substring(nameEq.length);
    }
  }

  return null;
};

const createRequestId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cms-fm-${crypto.randomUUID()}`;
  }

  return `cms-fm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const debugLog = (message: string, data: Record<string, unknown>): void => {
  if (isFileManagerDebugEnabled()) {
    console.debug(`[FileManager] ${message}`, data);
  }
};

const mapStatusToLikelyCause = (status?: number): { source: FileManagerErrorSource; likelyCause: string; code: string } => {
  switch (status) {
    case 0:
      return {
        source: "network",
        code: "NETWORK_ERROR",
        likelyCause: "Browser could not reach corporate-be. Check base URL, routing, DNS, VPN, proxy, TLS, or CORS.",
      };
    case 401:
    case 403:
      return {
        source: "auth",
        code: "AUTH_OR_PERMISSION_ERROR",
        likelyCause: "CMS session, permission, CSRF token, or corporate-be to corporate-fm auth may be invalid.",
      };
    case 404:
      return {
        source: "routing",
        code: "ROUTE_NOT_FOUND",
        likelyCause: "Endpoint path or base URL is wrong, or the route is not deployed.",
      };
    case 413:
      return {
        source: "validation",
        code: "PAYLOAD_TOO_LARGE",
        likelyCause: "Upload size exceeds CMS, corporate-be, corporate-fm, or proxy limits.",
      };
    case 415:
      return {
        source: "validation",
        code: "UNSUPPORTED_FILE_TYPE",
        likelyCause: "File extension or MIME type was rejected by upload validation.",
      };
    default:
      return {
        source: "corporate-be",
        code: status ? `HTTP_${status}` : "UNKNOWN_ERROR",
        likelyCause: "Check corporate-be, corporate-fm, and S3 logs using the request ID.",
      };
  }
};

const normalizeSource = (value: unknown, fallback: FileManagerErrorSource): FileManagerErrorSource => {
  if (
    value === "corporate-be" ||
    value === "corporate-fm" ||
    value === "aws-s3" ||
    value === "cors" ||
    value === "network" ||
    value === "routing" ||
    value === "auth" ||
    value === "validation"
  ) {
    return value;
  }

  return fallback;
};

const buildApiError = (
  endpoint: string,
  response: Response | null,
  payload: ApiPayload | null,
  outboundRequestId: string,
  fallbackMessage = "File Manager request failed"
): FileManagerApiError => {
  const status = response?.status;
  const statusHint = mapStatusToLikelyCause(status);
  const nestedDiagnostic = payload?.details?.details?.diagnostic;
  const source = normalizeSource(
    nestedDiagnostic?.source || payload?.details?.source,
    statusHint.source
  );
  const requestId =
    response?.headers.get("x-request-id") ||
    payload?.requestId ||
    payload?.details?.requestId ||
    outboundRequestId;
  const errorField = payload?.error;
  const errorCode = typeof errorField === 'string'
    ? errorField
    : (errorField && typeof errorField === 'object' ? errorField.code : undefined);
  const errorMessage = errorField && typeof errorField === 'object' ? errorField.message : undefined;
  const code =
    nestedDiagnostic?.code ||
    payload?.details?.code ||
    payload?.code ||
    errorCode ||
    statusHint.code;
  const likelyCause =
    nestedDiagnostic?.likelyCause ||
    payload?.details?.likelyCause ||
    statusHint.likelyCause;

  return new FileManagerApiError(payload?.message || nestedDiagnostic?.message || errorMessage || fallbackMessage, {
    status,
    code,
    source,
    endpoint,
    requestId,
    likelyCause,
    details: payload?.details || null,
  });
};

const readJsonPayload = async (response: Response): Promise<ApiPayload | null> => {
  const text = await response.text().catch(() => "");
  if (!text) return null;

  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return { message: text };
  }
};

const formatErrorForLog = (error: unknown): Record<string, unknown> => {
  if (error instanceof FileManagerApiError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      source: error.source,
      requestId: error.requestId,
      endpoint: error.endpoint,
      likelyCause: error.likelyCause,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown error",
  };
};

export const describeFileManagerError = (error: unknown): {
  message: string;
  source?: string;
  status?: number;
  code?: string;
  requestId?: string;
  likelyCause?: string;
} => {
  if (error instanceof FileManagerApiError) {
    return {
      message: error.message,
      source: error.source,
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      likelyCause: error.likelyCause,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown File Manager error",
  };
};

class FileManagerService {
  private getApiUrl(endpoint: string): string {
    return `${getApiV1BaseUrl()}${endpoint}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    operation = endpoint
  ): Promise<T> {
    const url = this.getApiUrl(endpoint);
    const requestId = createRequestId();
    const method = options.method || "GET";
    const bodyIsFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
    const csrfToken = getCookie(CSRF_TOKEN_KEY);
    const headers: HeadersInit = {
      ...(!bodyIsFormData ? { "Content-Type": "application/json" } : {}),
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      "X-Request-ID": requestId,
      ...(options.headers || {}),
    };

    const sendRequest = () => fetch(url, {
      ...options,
      method,
      headers,
      credentials: "include",
    });

    debugLog("request:start", { operation, method, endpoint, url, requestId });

    let response: Response;
    try {
      response = await sendRequest();
    } catch (networkError) {
      const error = new FileManagerApiError(
        "Tidak dapat terhubung ke gateway File Manager",
        {
          status: 0,
          code: "NETWORK_OR_CORS_ERROR",
          source: "network",
          endpoint,
          requestId,
          likelyCause: "Browser could not reach corporate-be. Check NEXT_PUBLIC_API_URL, routing, DNS, VPN/proxy, TLS, or CORS.",
          details: networkError instanceof Error ? { message: networkError.message } : null,
        }
      );
      debugLog("request:error", formatErrorForLog(error));
      throw error;
    }

    let payload = await readJsonPayload(response);

    if (!response.ok && isUnauthorizedOrExpired(response.status, payload)) {
      try {
        await refreshAuthSession();
        response = await sendRequest();
        payload = await readJsonPayload(response);
      } catch (refreshError) {
        dispatchSessionExpired({ status: response.status, error: payload, url });
        throw refreshError instanceof Error
          ? refreshError
          : createSessionExpiredError(payload);
      }
    }

    if (!response.ok || payload?.success === false) {
      if (isUnauthorizedOrExpired(response.status, payload)) {
        dispatchSessionExpired({ status: response.status, error: payload, url });
        throw createSessionExpiredError(payload);
      }

      const error = buildApiError(endpoint, response, payload, requestId);
      debugLog("request:error", formatErrorForLog(error));
      throw error;
    }

    debugLog("request:success", {
      operation,
      method,
      endpoint,
      requestId: response.headers.get("x-request-id") || requestId,
    });

    return payload as T;
  }

  async uploadFiles(files: File[], folderId?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (folderId) {
      formData.append("folderId", folderId);
    }

    return this.request<FileUploadResponse>("/media/upload", {
      method: "POST",
      body: formData,
    }, "upload");
  }

  async listFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    mimeType?: string;
    folderId?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<FileListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.mimeType) searchParams.set("mimeType", params.mimeType);
    if (params?.folderId) searchParams.set("folderId", params.folderId);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const query = searchParams.toString();
    return this.request<FileListResponse>(
      `/media/files${query ? `?${query}` : ""}`,
      { method: "GET" },
      "list-files"
    );
  }

  async getFile(id: string): Promise<FileDetailResponse> {
    return this.request<FileDetailResponse>(`/media/files/${id}`, { method: "GET" }, "get-file");
  }

  async getDownloadUrl(id: string): Promise<{ success: boolean; requestId?: string; data: { downloadUrl: string; filename: string } }> {
    return this.request(`/media/files/${id}?download=true`, { method: "GET" }, "download-url");
  }

  async deleteFile(id: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    return this.request(`/media/files/${id}`, { method: "DELETE" }, "delete-file");
  }

  async renameFile(id: string, name: string): Promise<FileMutationResponse> {
    return this.request(`/media/files/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }, "rename-file");
  }

  async transferFile(id: string, action: "copy" | "move", targetFolderId?: string): Promise<FileMutationResponse> {
    return this.request(`/media/files/${encodeURIComponent(id)}/transfer`, {
      method: "POST",
      body: JSON.stringify({ action, targetFolderId: targetFolderId || null }),
    }, `${action}-file`);
  }

  async listFolders(): Promise<FolderListResponse> {
    return this.request<FolderListResponse>("/media/folders", { method: "GET" }, "list-folders");
  }

  async createFolder(name: string, parentId?: string): Promise<FolderMutationResponse> {
    return this.request<FolderMutationResponse>("/media/folders", {
      method: "POST",
      body: JSON.stringify({
        name,
        ...(parentId ? { parentId } : {}),
      }),
    }, "create-folder");
  }

  async deleteFolder(id: string): Promise<{ success: boolean; message: string; requestId?: string }> {
    return this.request(`/media/folders/${id}`, { method: "DELETE" }, "delete-folder");
  }

  async renameFolder(id: string, name: string): Promise<FolderMutationResponse> {
    return this.request(`/media/folders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }, "rename-folder");
  }

  async transferFolder(id: string, action: "copy" | "move", targetFolderId?: string): Promise<FolderMutationResponse> {
    return this.request(`/media/folders/${encodeURIComponent(id)}/transfer`, {
      method: "POST",
      body: JSON.stringify({ action, targetFolderId: targetFolderId || null }),
    }, `${action}-folder`);
  }

  async getDebugInfo(prefix?: string): Promise<FileManagerDebugResponse> {
    const params = new URLSearchParams();
    if (prefix) params.set("prefix", prefix);

    return this.request<FileManagerDebugResponse>(
      `/media/debug/file-manager${params.toString() ? `?${params.toString()}` : ""}`,
      { method: "GET" },
      "debug-file-manager"
    );
  }
}

export const fileManagerService = new FileManagerService();
