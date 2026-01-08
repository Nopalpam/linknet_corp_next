'use client';

import React, { useRef, useState } from 'react';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEType } from 'tinymce';
import DOMPurify from 'dompurify';
import FilePicker from '@/components/FileManager/FilePicker';
import { FileItem } from '@/lib/stores/fileManagerStore';
import './RichTextEditor.css';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  height?: number;
  disabled?: boolean;
  error?: string;
  autoSave?: boolean;
  autoSaveKey?: string;
  plugins?: string[];
  toolbar?: string;
}

/**
 * RichTextEditor - WYSIWYG editor dengan integrasi file manager
 * 
 * Features:
 * - TinyMCE editor dengan toolbar lengkap
 * - Integrasi file manager untuk images dan media
 * - Auto-save draft ke localStorage
 * - HTML sanitization
 * - Max length validation
 * - Support React Hook Form
 * 
 * @example
 * ```tsx
 * const { register, setValue, watch } = useForm();
 * 
 * <RichTextEditor
 *   value={watch('content')}
 *   onChange={(content) => setValue('content', content)}
 *   maxLength={10000}
 *   autoSave
 *   autoSaveKey="post-draft"
 * />
 * ```
 */
export default function RichTextEditor({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Start writing...',
  maxLength,
  height = 500,
  disabled = false,
  error,
  autoSave = false,
  autoSaveKey = 'tinymce-draft',
  plugins = [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'help',
    'wordcount',
  ],
  toolbar = 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media link table | removeformat code fullscreen | help',
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEType | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const [imageCallback, setImageCallback] = useState<((url: string) => void) | null>(null);

  // Sanitize HTML content
  const sanitizeContent = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'strike',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'video',
        'audio',
        'source',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'div',
        'span',
        'pre',
        'code',
        'hr',
      ],
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'width',
        'height',
        'class',
        'id',
        'style',
        'target',
        'rel',
        'type',
        'controls',
        'autoplay',
        'loop',
        'muted',
      ],
    });
  };

  // Handle editor change
  const handleEditorChange = (content: string) => {
    const sanitized = sanitizeContent(content);
    
    // Check max length
    if (maxLength) {
      const textContent = editorRef.current?.getContent({ format: 'text' }) || '';
      setCurrentLength(textContent.length);
      
      if (textContent.length > maxLength) {
        return; // Prevent update if exceeded
      }
    }

    // Auto-save to localStorage
    if (autoSave) {
      try {
        localStorage.setItem(autoSaveKey, sanitized);
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }

    onChange?.(sanitized);
  };

  // Load draft from localStorage
  React.useEffect(() => {
    if (autoSave && !value) {
      try {
        const draft = localStorage.getItem(autoSaveKey);
        if (draft) {
          onChange?.(draft);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [autoSave, autoSaveKey]);

  // Clear draft
  const clearDraft = () => {
    if (autoSave) {
      try {
        localStorage.removeItem(autoSaveKey);
      } catch (error) {
        console.error('Failed to clear draft:', error);
      }
    }
  };

  // Handle image selection from file manager
  const handleImageSelect = (files: FileItem[]) => {
    if (files.length > 0 && imageCallback) {
      const file = files[0];
      const imageUrl = file.url;
      imageCallback(imageUrl);
      setImageCallback(null);
    }
    setShowImagePicker(false);
  };

  // Handle media selection from file manager
  const handleMediaSelect = (files: FileItem[]) => {
    if (files.length > 0 && editorRef.current) {
      const file = files[0];
      const mediaUrl = file.url;
      
      // Determine if video or audio
      const isVideo = file.mimeType?.startsWith('video/');
      const isAudio = file.mimeType?.startsWith('audio/');
      
      if (isVideo) {
        editorRef.current.insertContent(
          `<video controls width="640" height="360">
            <source src="${mediaUrl}" type="${file.mimeType}">
            Your browser does not support the video tag.
          </video>`
        );
      } else if (isAudio) {
        editorRef.current.insertContent(
          `<audio controls>
            <source src="${mediaUrl}" type="${file.mimeType}">
            Your browser does not support the audio tag.
          </audio>`
        );
      }
    }
    setShowMediaPicker(false);
  };

  return (
    <div className="rich-text-editor">
      <TinyMCEEditor
        apiKey="no-api-key" // Use self-hosted or get API key from tiny.cloud
        onInit={(evt, editor) => {
          editorRef.current = editor;
          
          // Get initial text length
          if (maxLength) {
            const textContent = editor.getContent({ format: 'text' });
            setCurrentLength(textContent.length);
          }
        }}
        value={value}
        onEditorChange={handleEditorChange}
        onBlur={onBlur}
        disabled={disabled}
        init={{
          height,
          menubar: true,
          plugins,
          toolbar,
          placeholder,
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; 
              font-size: 14px;
              line-height: 1.6;
            }
          `,
          
          // Custom image picker
          file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
              // Store callback for later use
              setImageCallback(() => callback);
              setShowImagePicker(true);
            } else if (meta.filetype === 'media') {
              setShowMediaPicker(true);
            }
          },

          // Image upload handler (optional, if you want drag-drop upload)
          images_upload_handler: async (blobInfo, progress) => {
            // You can implement direct upload here
            // For now, we'll use the file manager
            return new Promise((resolve, reject) => {
              reject('Please use the file manager to select images');
            });
          },

          // Setup function
          setup: (editor) => {
            // Add custom button for file manager
            editor.ui.registry.addButton('filemanager', {
              text: 'File Manager',
              icon: 'gallery',
              onAction: () => {
                setShowImagePicker(true);
              },
            });

            // Add custom button to clear draft
            if (autoSave) {
              editor.ui.registry.addButton('cleardraft', {
                text: 'Clear Draft',
                icon: 'remove',
                onAction: () => {
                  if (confirm('Clear saved draft?')) {
                    clearDraft();
                    editor.setContent('');
                    onChange?.('');
                  }
                },
              });
            }
          },

          // Paste handling
          paste_data_images: true,
          paste_as_text: false,
          
          // Link options
          link_default_target: '_blank',
          link_assume_external_targets: true,
          
          // Table options
          table_responsive_width: true,
          table_use_colgroups: true,
        }}
      />

      {/* Character count and max length */}
      {maxLength && (
        <div className="editor-footer">
          <span className={`char-count ${currentLength > maxLength ? 'error' : ''}`}>
            {currentLength} / {maxLength} characters
          </span>
        </div>
      )}

      {/* Error message */}
      {error && <div className="editor-error">{error}</div>}

      {/* Auto-save indicator */}
      {autoSave && (
        <div className="auto-save-indicator">
          <small className="text-muted">
            Auto-saving to browser storage...
          </small>
        </div>
      )}

      {/* Image Picker Modal */}
      <FilePicker
        isOpen={showImagePicker}
        onClose={() => {
          setShowImagePicker(false);
          setImageCallback(null);
        }}
        onSelect={handleImageSelect}
        accept="images"
        multiple={false}
      />

      {/* Media Picker Modal */}
      <FilePicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        accept="videos"
        multiple={false}
      />
    </div>
  );
}
