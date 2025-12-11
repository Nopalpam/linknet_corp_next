'use client';

import { useState, useCallback, useRef } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import Cropper, { Area, Point } from 'react-easy-crop';
import { useDropzone } from 'react-dropzone';
import NextImage from 'next/image';

interface AvatarUploadProps {
  currentAvatar: string | null;
  onUploadSuccess: (avatarUrl: string) => void;
}

interface CropData {
  file: File;
  imageUrl: string;
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess }: AvatarUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are allowed');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCropData({ file, imageUrl });
    setShowModal(true);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<Blob> => {
    if (!cropData || !croppedAreaPixels) {
      throw new Error('No crop data available');
    }

    const image = new Image();
    image.src = cropData.imageUrl;
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to cropped area size
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/webp', 0.95);
      };

      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  };

  const handleUpload = async () => {
    if (!cropData || !croppedAreaPixels) return;

    setUploading(true);
    setError(null);

    try {
      const croppedBlob = await createCroppedImage();
      
      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.webp');

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/avatar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload avatar');
      }

      const data = await response.json();
      onUploadSuccess(data.data.avatar);
      
      setShowModal(false);
      setCropData(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (cropData?.imageUrl) {
      URL.revokeObjectURL(cropData.imageUrl);
    }
    setCropData(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
  };

  return (
    <>
      {/* Avatar Display with Upload Area */}
      <div className="avatar-upload-container">
        <div
          {...getRootProps()}
          className={`avatar-dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} ref={fileInputRef} />
          
          {currentAvatar ? (
            <div className="avatar-preview">
              <NextImage 
                src={currentAvatar} 
                alt="Profile" 
                className="avatar-image" 
                fill 
                style={{ objectFit: 'cover' }} 
                unoptimized={currentAvatar.startsWith('blob:') || currentAvatar.startsWith('data:')}
              />
              <div className="avatar-overlay">
                <i className="bi bi-camera"></i>
                <span>Change Photo</span>
              </div>
            </div>
          ) : (
            <div className="avatar-placeholder">
              <i className="bi bi-person-circle"></i>
              <p className="mb-0">
                {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="danger" className="mt-2" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <small className="text-muted d-block mt-2">
          Maximum size: 2MB. Allowed formats: JPG, PNG, WebP
        </small>
      </div>

      {/* Crop Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Crop Avatar</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {cropData && (
            <div className="crop-container">
              <Cropper
                image={cropData.imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
          )}
          
          <div className="mt-3">
            <label htmlFor="zoom-slider" className="form-label">
              Zoom
            </label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range"
            />
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .avatar-upload-container {
          max-width: 300px;
        }

        .avatar-dropzone {
          width: 200px;
          height: 200px;
          border: 2px dashed #dee2e6;
          border-radius: 50%;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
        }

        .avatar-dropzone:hover,
        .avatar-dropzone.active {
          border-color: #0d6efd;
          background-color: #f8f9fa;
        }

        .avatar-preview {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .avatar-preview:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-overlay i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #6c757d;
        }

        .avatar-placeholder i {
          font-size: 4rem;
          margin-bottom: 0.5rem;
        }

        .crop-container {
          position: relative;
          width: 100%;
          height: 400px;
          background: #333;
        }
      `}</style>
    </>
  );
}
