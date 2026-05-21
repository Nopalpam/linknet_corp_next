"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  fileManagerService,
  FileItem,
  MediaFolder,
} from "@/services/filemanager.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileTypeInfo(mimeType: string): { label: string; color: string } {
  if (mimeType.startsWith("image/")) return { label: "Image", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (mimeType === "application/pdf") return { label: "PDF", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return { label: "Excel", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (mimeType.includes("document") || mimeType.includes("word")) return { label: "Word", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
  if (mimeType.startsWith("video/")) return { label: "Video", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
  if (mimeType.startsWith("audio/")) return { label: "Audio", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  return { label: "File", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };
}

function findFolderById(folders: MediaFolder[], folderId: string | null): MediaFolder | null {
  if (!folderId) return null;

  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }

    const childMatch = findFolderById(folder.children || [], folderId);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

type FolderTreeItemProps = {
  folder: MediaFolder;
  activeFolderId: string | null;
  deletingFolderId: string | null;
  depth?: number;
  onSelect: (folderId: string) => void;
  onDelete: (folder: MediaFolder) => void;
};

function FolderTreeItem({
  folder,
  activeFolderId,
  deletingFolderId,
  depth = 0,
  onSelect,
  onDelete,
}: FolderTreeItemProps) {
  const isActive = activeFolderId === folder.id;

  return (
    <div className="space-y-1">
      <div className="group flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          className={`flex flex-1 items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors ${
            isActive
              ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <span className="min-w-0 flex-1 truncate">{folder.name}</span>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
            {folder.fileCount || 0}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(folder)}
          disabled={deletingFolderId === folder.id}
          className="rounded-lg p-1.5 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-100 dark:hover:bg-red-900/20"
          title="Delete folder"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {(folder.children || []).map((childFolder) => (
        <FolderTreeItem
          key={childFolder.id}
          folder={childFolder}
          activeFolderId={activeFolderId}
          deletingFolderId={deletingFolderId}
          depth={depth + 1}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function FileManagerPage() {
  const toast = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
  const itemsPerPage = 20;

  const selectedFolder = findFolderById(folders, selectedFolderId);

  const fetchFolders = useCallback(async () => {
    try {
      setFoldersLoading(true);
      const response = await fileManagerService.listFolders();
      setFolders(response.data.items);
      setSelectedFolderId((currentFolderId) => (
        currentFolderId && findFolderById(response.data.items, currentFolderId)
          ? currentFolderId
          : null
      ));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch folders";
      toast.error(message);
      setFolders([]);
    } finally {
      setFoldersLoading(false);
    }
  }, [toast]);

  const fetchFiles = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await fileManagerService.listFiles({
        page,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        mimeType: filterType || undefined,
        folderId: selectedFolderId || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setFiles(response.data.files);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch files";
      toast.error(message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery, selectedFolderId, toast]);

  useEffect(() => {
    void fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    void fetchFiles(1);
  }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const response = await fileManagerService.uploadFiles(acceptedFiles, selectedFolderId || undefined);
      toast.success(`${response.data.totalUploaded} file(s) uploaded successfully`, 3000);
      await Promise.all([fetchFiles(1), fetchFolders()]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [fetchFiles, fetchFolders, selectedFolderId, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 10,
    disabled: uploading,
  });

  const handleCreateFolder = useCallback(async () => {
    const normalizedName = newFolderName.trim();
    if (!normalizedName) {
      toast.error("Folder name is required");
      return;
    }

    setCreatingFolder(true);
    try {
      const response = await fileManagerService.createFolder(normalizedName, selectedFolderId || undefined);
      toast.success(response.message || "Folder created successfully", 3000);
      setNewFolderName("");
      await fetchFolders();
      setSelectedFolderId(response.data.folder.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create folder";
      toast.error(message);
    } finally {
      setCreatingFolder(false);
    }
  }, [fetchFolders, newFolderName, selectedFolderId, toast]);

  const handleDeleteFolder = useCallback(async (folder: MediaFolder) => {
    const confirmed = window.confirm(`Delete folder \"${folder.name}\"? Folder must already be empty.`);
    if (!confirmed) return;

    setDeletingFolderId(folder.id);
    try {
      await fileManagerService.deleteFolder(folder.id);
      toast.success("Folder deleted successfully", 3000);
      setSelectedFolderId((currentFolderId) => (currentFolderId === folder.id ? null : currentFolderId));
      await fetchFolders();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete folder";
      toast.error(message);
    } finally {
      setDeletingFolderId(null);
    }
  }, [fetchFolders, toast]);

  const handleDeleteFile = async () => {
    if (!selectedFile) return;

    setDeletingFile(true);
    try {
      await fileManagerService.deleteFile(selectedFile.id);
      toast.success("File deleted successfully", 3000);
      setShowDeleteConfirm(false);
      setShowDetail(false);
      setSelectedFile(null);
      await Promise.all([fetchFiles(1), fetchFolders()]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    } finally {
      setDeletingFile(false);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fileManagerService.getDownloadUrl(file.id);
      if (response.success && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      if (file.url) {
        window.open(file.url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div>
      <PageBreadCrumb pageTitle="File Manager" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Shared Media Library
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browser upload, Prisma-backed folder catalog, and internal S3 object operations now run through the backend media gateway.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
              {selectedFolder ? `Folder: ${selectedFolder.path}` : "Folder: shared root"}
            </span>
          </div>

          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                <svg className="h-6 w-6 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-r-transparent"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uploading to internal media service...</span>
                </div>
              ) : isDragActive ? (
                <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                  Drop files here to upload into the selected folder
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span>{" "}
                    or drag and drop files here
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Max 10 files per upload. Upload destination follows the selected folder.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-gray-200 p-4 dark:border-gray-800 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Folders</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Prisma metadata drives the folder tree.</p>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleCreateFolder();
                  }
                }}
                placeholder={selectedFolder ? `New folder inside ${selectedFolder.name}` : "New root folder"}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => void handleCreateFolder()}
                disabled={creatingFolder}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {creatingFolder ? "..." : "Add"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={`mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedFolderId === null
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span>All media</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-900/40 dark:text-gray-400">
                {totalItems}
              </span>
            </button>

            <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
              {foldersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-r-transparent"></div>
                </div>
              ) : folders.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No folders yet. Create the first folder or upload directly into the shared root.
                </p>
              ) : (
                folders.map((folder) => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    activeFolderId={selectedFolderId}
                    deletingFolderId={deletingFolderId}
                    onSelect={setSelectedFolderId}
                    onDelete={(targetFolder) => void handleDeleteFolder(targetFolder)}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Media Workspace</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedFolder
                      ? `Showing files inside ${selectedFolder.path}`
                      : "Showing files across the shared library"}
                  </p>
                </div>
                <div className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  {totalItems} file(s)
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1 sm:max-w-xs">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">All Types</option>
                    <option value="image/">Images</option>
                    <option value="application/pdf">PDF</option>
                    <option value="video/">Videos</option>
                    <option value="audio/">Audio</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-xs ${viewMode === "grid" ? "bg-brand-600 text-white" : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                      title="Grid view"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 text-xs ${viewMode === "list" ? "bg-brand-600 text-white" : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}
                      title="List view"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-r-transparent"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="py-12 text-center">
                  <svg className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No files found</p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    {selectedFolder ? "Upload files into this folder or switch to another folder." : "Upload files using the area above."}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {files.map((file) => {
                    const typeInfo = getFileTypeInfo(file.mimeType);
                    const isImage = file.mimeType.startsWith("image/");

                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDetail(true);
                        }}
                        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 transition-all hover:border-brand-400 hover:shadow-md dark:border-gray-700"
                      >
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                          {isImage && file.url ? (
                            <Image
                              src={file.url}
                              alt={file.originalName}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <svg className="h-10 w-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-xs font-medium text-gray-800 dark:text-gray-200" title={file.originalName}>
                            {file.originalName}
                          </p>
                          <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="truncate">{file.folder?.name || "Root"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                      <tr>
                        <th className="px-4 py-3">File</th>
                        <th className="px-4 py-3">Folder</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">Uploaded</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {files.map((file) => {
                        const typeInfo = getFileTypeInfo(file.mimeType);
                        const isImage = file.mimeType.startsWith("image/");

                        return (
                          <tr key={file.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                                  {isImage && file.url ? (
                                    <Image src={file.url} alt={file.originalName} width={40} height={40} className="object-cover" unoptimized />
                                  ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                  )}
                                </div>
                                <span className="max-w-[220px] truncate font-medium text-gray-800 dark:text-gray-200" title={file.originalName}>
                                  {file.originalName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                              {file.folder?.path || "shared root"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                              {new Date(file.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(file)}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"
                                  title="Download"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setShowDetail(true);
                                  }}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-700"
                                  title="Details"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                  title="Delete"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.11 0 00-7.5 0" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchFiles(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => void fetchFiles(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {showDetail && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">File Details</h4>
              <button
                type="button"
                onClick={() => {
                  setShowDetail(false);
                  setSelectedFile(null);
                }}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedFile.mimeType.startsWith("image/") && selectedFile.url && (
              <div className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                <Image
                  src={selectedFile.url}
                  alt={selectedFile.originalName}
                  width={500}
                  height={300}
                  className="max-h-64 w-full object-contain"
                  unoptimized
                />
              </div>
            )}

            <div className="mb-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="break-all text-sm font-medium text-gray-800 dark:text-gray-200">{selectedFile.originalName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Folder</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{selectedFile.folder?.path || "shared root"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{selectedFile.mimeType}</p>
                </div>
                {selectedFile.width && selectedFile.height && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dimensions</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{selectedFile.width} × {selectedFile.height}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{new Date(selectedFile.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Downloads</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{selectedFile.downloads}</p>
                </div>
                {selectedFile.createdBy && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded by</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {selectedFile.createdBy.firstName} {selectedFile.createdBy.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDownload(selectedFile)}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">Delete File</h4>
            <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this file?
            </p>
            <p className="mb-6 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
              {selectedFile.originalName}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFile}
                disabled={deletingFile}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingFile ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
