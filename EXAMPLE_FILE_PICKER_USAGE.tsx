// Example: Using FilePicker in a Blog Post Form
'use client';

import React, { useState } from 'react';
import { FilePicker } from '@/components/FileManager';
import { FileItem } from '@/lib/stores/fileManagerStore';
import Image from 'next/image';
import { FiX, FiImage } from 'react-icons/fi';

interface BlogFormData {
  title: string;
  content: string;
  featuredImage?: FileItem;
  galleryImages: FileItem[];
}

export default function BlogPostForm() {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    featuredImage: undefined,
    galleryImages: [],
  });

  const handleFeaturedImageSelect = (files: FileItem[]) => {
    if (files.length > 0) {
      setFormData({ ...formData, featuredImage: files[0] });
    }
  };

  const handleGalleryImagesSelect = (files: FileItem[]) => {
    setFormData({ ...formData, galleryImages: files });
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...formData.galleryImages];
    newGallery.splice(index, 1);
    setFormData({ ...formData, galleryImages: newGallery });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for API
    const postData = {
      title: formData.title,
      content: formData.content,
      featuredImageUrl: formData.featuredImage?.url,
      featuredImageId: formData.featuredImage?.id,
      galleryImageIds: formData.galleryImages.map(img => img.id),
    };

    console.log('Submitting:', postData);
    // Send to API...
  };

  return (
    <div className="blog-post-form">
      <h1>Create Blog Post</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label>Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={10}
            required
          />
        </div>

        {/* Featured Image */}
        <div className="form-group">
          <label>Featured Image</label>
          
          {formData.featuredImage ? (
            <div className="image-preview">
              <Image
                src={formData.featuredImage.thumbnails?.medium || formData.featuredImage.url}
                alt={formData.featuredImage.originalName}
                width={300}
                height={200}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, featuredImage: undefined })}
                className="remove-btn"
              >
                <FiX /> Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="select-image-btn"
            >
              <FiImage /> Select Featured Image
            </button>
          )}
        </div>

        {/* Gallery Images */}
        <div className="form-group">
          <label>Gallery Images</label>
          
          <div className="gallery-grid">
            {formData.galleryImages.map((image, index) => (
              <div key={image.id} className="gallery-item">
                <Image
                  src={image.thumbnails?.small || image.url}
                  alt={image.originalName}
                  width={150}
                  height={150}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="remove-btn"
                >
                  <FiX />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setShowGalleryPicker(true)}
              className="add-gallery-btn"
            >
              <FiImage /> Add Images
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Publish Post
          </button>
        </div>
      </form>

      {/* File Pickers */}
      <FilePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={handleFeaturedImageSelect}
        multiple={false}
        accept="images"
      />

      <FilePicker
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={handleGalleryImagesSelect}
        multiple={true}
        accept="images"
        maxFiles={10}
      />
    </div>
  );
}
