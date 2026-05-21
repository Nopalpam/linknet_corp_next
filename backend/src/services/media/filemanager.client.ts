type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

interface BulkDeleteResult {
  deletedKeys: string[];
  failedKeys: string[];
}

export interface InternalMediaStoredFile {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

const FILEMANAGER_INTERNAL_URL = (process.env.FILEMANAGER_INTERNAL_URL || 'http://localhost:3000').replace(/\/+$/, '');
const FILEMANAGER_API_KEY = process.env.FILEMANAGER_API_KEY?.trim();

const buildHeaders = (headers?: Record<string, string>): Record<string, string> => ({
  ...(headers || {}),
  ...(FILEMANAGER_API_KEY ? { 'x-api-key': FILEMANAGER_API_KEY } : {}),
});

const requestFilemanager = async <T>(
  routePath: string,
  init: RequestInit & { headers?: Record<string, string> },
): Promise<T> => {
  const response = await fetch(`${FILEMANAGER_INTERNAL_URL}${routePath}`, {
    ...init,
    headers: buildHeaders(init.headers),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Filemanager request failed with status ${response.status}`
    );
  }

  return payload.data;
};

export const uploadFilesToFilemanager = async (
  files: Express.Multer.File[],
  folder: string,
): Promise<{ folder: string; files: InternalMediaStoredFile[]; totalUploaded: number }> => {
  const formData = new FormData();
  formData.append('folder', folder);

  for (const file of files) {
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('files', blob, file.originalname);
  }

  return requestFilemanager('/api/media/upload', {
    method: 'POST',
    body: formData,
  });
};

export const deleteObjectFromFilemanager = async (key: string): Promise<void> => {
  await requestFilemanager<{ key: string }>('/api/media/object', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });
};

export const bulkDeleteObjectsFromFilemanager = async (
  keys: string[],
): Promise<BulkDeleteResult> => {
  return requestFilemanager<BulkDeleteResult>('/api/media/objects/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys }),
  });
};