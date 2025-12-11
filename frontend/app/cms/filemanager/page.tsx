'use client';

import React, { useEffect, useState } from 'react';
import { useFileManagerStore } from '@/lib/stores/fileManagerStore';
import { getFiles, getFolders, uploadFiles as uploadFilesApi, deleteFiles as deleteFilesApi } from '@/lib/api/fileManager';
import FileUpload from '@/components/FileManager/FileUpload';
import FileBrowser from '@/components/FileManager/FileBrowser';
import { FiUpload, FiGrid, FiList, FiSearch, FiTrash2 } from 'react-icons/fi';
import styles from './page.module.scss';

export default function FileManagerPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    files,
    currentFolderId,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    page,
    limit,
    total,
    isLoading,
    selectedFiles,
    setFiles,
    setFolders,
    setViewMode,
    setSearchQuery,
    setPage,
    setTotal,
    setIsLoading,
    toggleFileSelection,
    clearSelection,
  } = useFileManagerStore();

  // Load files and folders
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadFiles(), loadFolders()]);
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, page, sortBy, sortOrder, searchQuery]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const result = await getFiles({
        page,
        limit,
        search: searchQuery,
        folderId: currentFolderId || undefined,
        sortBy,
        sortOrder,
      });
      setFiles(result.files);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const result = await getFolders();
      setFolders(result);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleUpload = async (filesToUpload: File[]) => {
    try {
      await uploadFilesApi({
        files: filesToUpload,
        folderId: currentFolderId || undefined,
      });
      await loadFiles();
      setShowUpload(false);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!confirm(`Delete ${selectedFiles.size} file(s)?`)) return;

    try {
      await deleteFilesApi(Array.from(selectedFiles));
      clearSelection();
      await loadFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete files');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.fileManager}>
      <div className={styles.header}>
        <h1>File Manager</h1>
        <div className={styles.toolbar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search files..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>

          <div className={styles.actions}>
            <button
              onClick={() => setShowUpload(true)}
              className={styles.uploadBtn}
              type="button"
            >
              <FiUpload /> Upload
            </button>

            {selectedFiles.size > 0 && (
              <button
                onClick={handleDelete}
                className={styles.deleteBtn}
                type="button"
              >
                <FiTrash2 /> Delete ({selectedFiles.size})
              </button>
            )}

            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? styles.active : ''}
                type="button"
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? styles.active : ''}
                type="button"
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <FileBrowser
              files={files}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              onFileSelect={toggleFileSelection}
            />

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  type="button"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showUpload && (
        <div className={styles.modal}>
          <FileUpload
            onUpload={handleUpload}
            onClose={() => setShowUpload(false)}
          />
        </div>
      )}
    </div>
  );
}
