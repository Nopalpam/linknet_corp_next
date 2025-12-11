'use client';

import React from 'react';
import Image from 'next/image';
import { FileItem, ViewMode } from '@/lib/stores/fileManagerStore';
import { FiFile, FiImage, FiVideo, FiFileText, FiCheck } from 'react-icons/fi';
import styles from './FileBrowser.module.scss';
import { format } from 'date-fns';

interface FileBrowserProps {
  files: FileItem[];
  viewMode: ViewMode;
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
  onFileDoubleClick?: (file: FileItem) => void;
}

export default function FileBrowser({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onFileDoubleClick,
}: FileBrowserProps) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FiImage />;
    if (mimeType.startsWith('video/')) return <FiVideo />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FiFileText />;
    return <FiFile />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getThumbnail = (file: FileItem) => {
    if (file.thumbnails?.medium) {
      return file.thumbnails.medium;
    }
    if (file.mimeType.startsWith('image/')) {
      return file.url;
    }
    return null;
  };

  if (files.length === 0) {
    return (
      <div className={styles.empty}>
        <FiFile className={styles.emptyIcon} />
        <p>No files found</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className={styles.gridView}>
        {files.map((file) => {
          const thumbnail = getThumbnail(file);
          const isSelected = selectedFiles.has(file.id);

          return (
            <div
              key={file.id}
              className={`${styles.gridItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => onFileSelect(file.id)}
              onDoubleClick={() => onFileDoubleClick?.(file)}
            >
              {isSelected && (
                <div className={styles.checkmark}>
                  <FiCheck />
                </div>
              )}
              
              <div className={styles.thumbnail}>
                {thumbnail ? (
                  <Image src={thumbnail} alt={file.originalName} width={200} height={200} />
                ) : (
                  <div className={styles.iconPlaceholder}>
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
              </div>

              <div className={styles.fileInfo}>
                <div className={styles.fileName} title={file.originalName}>
                  {file.originalName}
                </div>
                <div className={styles.fileSize}>
                  {formatFileSize(file.size)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className={styles.listView}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Name</th>
            <th style={{ width: '100px' }}>Size</th>
            <th style={{ width: '150px' }}>Type</th>
            <th style={{ width: '180px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const isSelected = selectedFiles.has(file.id);
            const thumbnail = getThumbnail(file);

            return (
              <tr
                key={file.id}
                className={isSelected ? styles.selected : ''}
                onClick={() => onFileSelect(file.id)}
                onDoubleClick={() => onFileDoubleClick?.(file)}
              >
                <td>
                  <div className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onFileSelect(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </td>
                <td>
                  <div className={styles.nameCell}>
                    {thumbnail ? (
                      <Image src={thumbnail} alt={file.originalName} className={styles.miniThumb} width={40} height={40} />
                    ) : (
                      <div className={styles.miniIcon}>
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                    <span>{file.originalName}</span>
                  </div>
                </td>
                <td>{formatFileSize(file.size)}</td>
                <td>
                  <span className={styles.fileType}>
                    {file.mimeType.split('/')[1]?.toUpperCase()}
                  </span>
                </td>
                <td>{format(new Date(file.createdAt), 'MMM dd, yyyy HH:mm')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
