'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import styles from './FileUpload.module.scss';

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onClose?: () => void;
}

export default function FileUpload({
  onUpload,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
  },
  maxFiles = 10,
  maxSize = 200 * 1024 * 1024, // 200MB
  onClose,
}: FileUploadProps) {
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    onDrop: (acceptedFiles) => {
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending' as const,
      }));
      setFilesWithProgress([...filesWithProgress, ...newFiles]);
    },
  });

  const removeFile = (index: number) => {
    setFilesWithProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (filesWithProgress.length === 0 || isUploading) return;

    setIsUploading(true);

    try {
      // Update all files to uploading status
      setFilesWithProgress((prev) =>
        prev.map((f) => ({ ...f, status: 'uploading' as const }))
      );

      // Upload files
      const files = filesWithProgress.map((f) => f.file);
      await onUpload(files);

      // Mark all as success
      setFilesWithProgress((prev) =>
        prev.map((f) => ({ ...f, progress: 100, status: 'success' as const }))
      );

      // Close after success
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      // Mark all as error
      setFilesWithProgress((prev) =>
        prev.map((f) => ({
          ...f,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Upload failed',
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'success':
        return <FiCheck className={styles.iconSuccess} />;
      case 'error':
        return <FiAlertCircle className={styles.iconError} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.fileUpload}>
      <div className={styles.header}>
        <h3>Upload Files</h3>
        {onClose && (
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <FiX />
          </button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
      >
        <input {...getInputProps()} />
        <FiUpload className={styles.uploadIcon} />
        <p className={styles.dropzoneText}>
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className={styles.dropzoneHint}>
          Max {maxFiles} files, up to {formatFileSize(maxSize)} each
        </p>
      </div>

      {filesWithProgress.length > 0 && (
        <div className={styles.fileList}>
          <h4>Selected Files ({filesWithProgress.length})</h4>
          {filesWithProgress.map((item, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <div className={styles.fileName}>
                  {item.file.name}
                  {getStatusIcon(item.status)}
                </div>
                <div className={styles.fileSize}>
                  {formatFileSize(item.file.size)}
                </div>
              </div>

              {item.status === 'uploading' && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {item.status === 'error' && item.error && (
                <div className={styles.error}>{item.error}</div>
              )}

              {item.status === 'pending' && (
                <button
                  onClick={() => removeFile(index)}
                  className={styles.removeBtn}
                  type="button"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        {onClose && (
          <button
            onClick={onClose}
            className={styles.cancelBtn}
            type="button"
            disabled={isUploading}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          className={styles.uploadBtn}
          disabled={filesWithProgress.length === 0 || isUploading}
          type="button"
        >
          {isUploading ? 'Uploading...' : `Upload ${filesWithProgress.length} file(s)`}
        </button>
      </div>
    </div>
  );
}
