'use client';

import React, { useEffect, useState } from 'react';
import { getFiles } from '@/lib/api/fileManager';
import { FileItem } from '@/lib/stores/fileManagerStore';
import Image from 'next/image';
import { FiX, FiCheck, FiFile } from 'react-icons/fi';
import styles from './FilePicker.module.scss';

interface FilePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: FileItem[]) => void;
  multiple?: boolean;
  accept?: 'images' | 'documents' | 'videos' | 'all';
  maxFiles?: number;
}

export default function FilePicker({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = 'all',
  maxFiles = 10,
}: FilePickerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, search]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const typeFilter = accept !== 'all' ? accept.replace('s', '') : '';
      const result = await getFiles({
        search,
        type: typeFilter,
        limit: 50,
      });
      setFiles(result.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      if (multiple) {
        if (newSelected.size < maxFiles) {
          newSelected.add(fileId);
        }
      } else {
        newSelected.clear();
        newSelected.add(fileId);
      }
    }
    setSelectedFiles(newSelected);
  };

  const handleConfirm = () => {
    const selected = files.filter((f) => selectedFiles.has(f.id));
    onSelect(selected);
    setSelectedFiles(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedFiles(new Set());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Select {multiple ? 'Files' : 'File'}</h3>
          <button onClick={handleCancel} className={styles.closeBtn} type="button">
            <FiX />
          </button>
        </div>

        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : files.length === 0 ? (
            <div className={styles.empty}>
              <FiFile />
              <p>No files found</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {files.map((file) => {
                const isSelected = selectedFiles.has(file.id);
                const isImage = file.mimeType.startsWith('image/');
                const thumbnail = file.thumbnails?.medium || file.url;

                return (
                  <div
                    key={file.id}
                    className={`${styles.item} ${isSelected ? styles.selected : ''}`}
                    onClick={() => toggleSelection(file.id)}
                  >
                    {isSelected && (
                      <div className={styles.checkmark}>
                        <FiCheck />
                      </div>
                    )}

                    <div className={styles.thumbnail}>
                      {isImage ? (
                        <Image
                          src={thumbnail}
                          alt={file.originalName}
                          width={150}
                          height={150}
                        />
                      ) : (
                        <div className={styles.icon}>
                          <FiFile />
                        </div>
                      )}
                    </div>

                    <div className={styles.name}>{file.originalName}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.info}>
            {selectedFiles.size > 0 && (
              <span>{selectedFiles.size} file(s) selected</span>
            )}
          </div>
          <div className={styles.actions}>
            <button onClick={handleCancel} className={styles.cancelBtn} type="button">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={styles.confirmBtn}
              disabled={selectedFiles.size === 0}
              type="button"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
