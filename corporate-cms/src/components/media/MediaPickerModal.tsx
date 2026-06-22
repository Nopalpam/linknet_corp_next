"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  FileIcon,
  FileImage,
  Folder,
  Loader2,
  RefreshCw,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import {
  fileManagerService,
  FileItem,
  MediaFolder,
} from "@/services/filemanager.service";

export type MediaPickerKind = "image" | "pdf" | "video" | "audio" | "any";

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: FileItem) => void;
  kind?: MediaPickerKind;
  title?: string;
};

const MIME_PREFIX_BY_KIND: Record<MediaPickerKind, string | undefined> = {
  image: "image/",
  pdf: "application/pdf",
  video: "video/",
  audio: "audio/",
  any: undefined,
};

const ACCEPT_BY_KIND: Record<MediaPickerKind, string | undefined> = {
  image: "image/*",
  pdf: "application/pdf",
  video: "video/*",
  audio: "audio/*",
  any: undefined,
};

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function fileMatchesKind(file: File, kind: MediaPickerKind): boolean {
  const prefix = MIME_PREFIX_BY_KIND[kind];
  if (!prefix) return true;
  return prefix.endsWith("/") ? file.type.startsWith(prefix) : file.type === prefix;
}

function findFolderById(folders: MediaFolder[], folderId: string | null): MediaFolder | null {
  if (!folderId) return null;

  for (const folder of folders) {
    if (folder.id === folderId) return folder;

    const childMatch = findFolderById(folder.children || [], folderId);
    if (childMatch) return childMatch;
  }

  return null;
}

function FolderTree({
  folders,
  activeFolderId,
  onSelect,
  depth = 0,
}: {
  folders: MediaFolder[];
  activeFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  depth?: number;
}) {
  return (
    <div className={depth === 0 ? "space-y-1" : "mt-1 space-y-1"}>
      {folders.map((folder) => {
        const isActive = activeFolderId === folder.id;

        return (
          <div key={folder.id}>
            <button
              type="button"
              onClick={() => onSelect(folder.id)}
              className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-xs transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              style={{ paddingLeft: `${depth * 12 + 10}px` }}
            >
              <Folder className="h-4 w-4 flex-shrink-0" />
              <span className="min-w-0 flex-1 truncate">{folder.name}</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-950/40 dark:text-gray-400">
                {folder.fileCount || 0}
              </span>
            </button>
            {folder.children?.length ? (
              <FolderTree
                folders={folder.children}
                activeFolderId={activeFolderId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  kind = "image",
  title,
}: MediaPickerModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mimeType = MIME_PREFIX_BY_KIND[kind];
  const accept = ACCEPT_BY_KIND[kind];
  const selectedFolder = useMemo(() => findFolderById(folders, selectedFolderId), [folders, selectedFolderId]);
  const dialogTitle = title || (kind === "any" ? "Choose File" : `Choose ${kind.charAt(0).toUpperCase()}${kind.slice(1)}`);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [isOpen, search]);

  const fetchFolders = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const response = await fileManagerService.listFolders();
      setFolders(response.data.items || []);
      setSelectedFolderId((current) => (
        current && findFolderById(response.data.items || [], current) ? current : null
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folders");
      setFolders([]);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const fetchFiles = useCallback(async (nextPage = 1) => {
    try {
      setLoadingFiles(true);
      setError(null);
      const response = await fileManagerService.listFiles({
        page: nextPage,
        limit: 24,
        search: debouncedSearch || undefined,
        mimeType,
        folderId: selectedFolderId || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setFiles(response.data.files || []);
      setPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media files");
      setFiles([]);
      setPage(1);
      setTotalPages(1);
    } finally {
      setLoadingFiles(false);
    }
  }, [debouncedSearch, mimeType, selectedFolderId]);

  useEffect(() => {
    if (!isOpen) return;
    void fetchFolders();
  }, [fetchFolders, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    void fetchFiles(1);
  }, [fetchFiles, isOpen]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const invalidFile = selectedFiles.find((file) => !fileMatchesKind(file, kind));
    if (invalidFile) {
      setError(`"${invalidFile.name}" does not match the selected media type.`);
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await fileManagerService.uploadFiles(selectedFiles, selectedFolderId || undefined);
      event.target.value = "";
      await Promise.all([fetchFiles(1), fetchFolders()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = (file: FileItem) => {
    onSelect(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{dialogTitle}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select existing media or upload into {selectedFolder ? selectedFolder.path : "S3 root"}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Close media picker"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-h-0 border-b border-gray-200 p-4 dark:border-gray-800 lg:border-b-0 lg:border-r">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                selectedFolderId === null
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span>All media</span>
            </button>

            <div className="max-h-[52vh] overflow-y-auto pr-1">
              {loadingFolders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                </div>
              ) : folders.length ? (
                <FolderTree folders={folders} activeFolderId={selectedFolderId} onSelect={setSelectedFolderId} />
              ) : (
                <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No folders yet.
                </p>
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search media..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchFiles(page)}
                    disabled={loadingFiles || uploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingFiles ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {loadingFiles ? (
                <div className="flex h-72 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                </div>
              ) : files.length === 0 ? (
                <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 text-center dark:border-gray-700">
                  <FileIcon className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">No media found</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload a file or adjust the folder/search filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {files.map((file) => {
                    const isImage = file.mimeType.startsWith("image/");
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => handleSelect(file)}
                        className="group overflow-hidden rounded-lg border border-gray-200 text-left transition hover:border-brand-500 hover:shadow-md dark:border-gray-700"
                        title={file.originalName}
                      >
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                          {isImage && file.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={file.url} alt={file.originalName} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <FileIcon className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                          )}
                          <span className="absolute right-2 top-2 hidden rounded-full bg-brand-600 p-1 text-white shadow group-hover:inline-flex">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="flex items-center gap-1.5">
                            {isImage ? <FileImage className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" /> : <FileIcon className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />}
                            <p className="min-w-0 truncate text-xs font-medium text-gray-800 dark:text-gray-100">
                              {file.originalName}
                            </p>
                          </div>
                          <p className="truncate text-[11px] text-gray-400">
                            {formatFileSize(file.size)} - {file.folder?.name || "Root"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchFiles(page - 1)}
                    disabled={page <= 1 || loadingFiles}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => void fetchFiles(page + 1)}
                    disabled={page >= totalPages || loadingFiles}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
