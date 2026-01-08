# Rich Text Editor - WYSIWYG Editor dengan File Manager Integration

## 📋 Overview

Sistem WYSIWYG editor terintegrasi dengan file manager untuk membuat dan mengedit konten rich text dengan mudah. Menggunakan TinyMCE sebagai editor dengan fitur lengkap termasuk:

- ✅ Rich text formatting (bold, italic, headings, lists, dll)
- ✅ Integrasi file manager untuk images dan media
- ✅ Auto-save draft ke localStorage
- ✅ HTML sanitization (XSS protection)
- ✅ Character/content length validation
- ✅ Support React Hook Form
- ✅ Custom toolbar dan plugins

## 🚀 Quick Start

### 1. Basic Usage

```tsx
'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function MyPage() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
      maxLength={10000}
    />
  );
}
```

### 2. With React Hook Form

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RichTextEditor } from '@/components/RichTextEditor';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type FormData = z.infer<typeof schema>;

export default function NewsForm() {
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Submitted:', data);
    // Send to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          {...register('title')}
        />
        {errors.title && (
          <span className="text-danger">{errors.title.message}</span>
        )}
      </div>

      <div className="mb-3">
        <label>Content</label>
        <RichTextEditor
          value={watch('content')}
          onChange={(content) => setValue('content', content)}
          onBlur={() => {}} // Trigger validation
          error={errors.content?.message}
          maxLength={50000}
          autoSave
          autoSaveKey="news-draft"
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Publish
      </button>
    </form>
  );
}
```

### 3. With Auto-Save

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  autoSave // Enable auto-save
  autoSaveKey="my-article-draft" // Unique key for localStorage
  placeholder="Your content will be auto-saved..."
/>
```

### 4. Custom Configuration

```tsx
<RichTextEditor
  value={content}
  onChange={setContent}
  height={600} // Custom height
  plugins={[
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'code',
    'table',
  ]}
  toolbar="undo redo | bold italic | link image"
  maxLength={20000}
/>
```

## 🎨 Using File Manager for Images

Editor sudah terintegrasi dengan file manager. Untuk insert image:

1. Klik tombol **"Image"** di toolbar
2. Modal file manager akan terbuka
3. Browse dan pilih image yang sudah di-upload
4. Klik "Select" untuk insert image ke editor
5. Image akan muncul di editor content

### Insert Image Programmatically

```tsx
const editorRef = useRef<Editor>(null);

const insertImage = (imageUrl: string) => {
  if (editorRef.current) {
    editorRef.current.insertContent(
      `<img src="${imageUrl}" alt="Image" />`
    );
  }
};
```

## 📦 Component Props

### RichTextEditorProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Editor content (HTML) |
| `onChange` | `(content: string) => void` | - | Callback saat content berubah |
| `onBlur` | `() => void` | - | Callback saat editor blur |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `maxLength` | `number` | - | Maximum character length |
| `height` | `number` | `500` | Editor height in pixels |
| `disabled` | `boolean` | `false` | Disable editor |
| `error` | `string` | - | Error message to display |
| `autoSave` | `boolean` | `false` | Enable auto-save to localStorage |
| `autoSaveKey` | `string` | `'tinymce-draft'` | localStorage key for auto-save |
| `plugins` | `string[]` | See default | TinyMCE plugins |
| `toolbar` | `string` | See default | Toolbar configuration |

## 🔒 Backend - HTML Sanitization

### 1. Sanitize HTML Content

```typescript
import { sanitizeHtmlContent } from '@/utils/htmlSanitizer';

// In your controller
const content = req.body.content;
const sanitized = sanitizeHtmlContent(content);

await prisma.post.create({
  data: {
    content: sanitized,
    // ... other fields
  },
});
```

### 2. Validation with Zod

```typescript
import { richTextWithLengthSchema } from '@/validations/richTextValidation';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: richTextWithLengthSchema(50000), // Max 50k characters
});

// In your route
app.post('/api/posts', async (req, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    
    // data.content is already sanitized
    const post = await prisma.post.create({ data });
    
    res.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    throw error;
  }
});
```

### 3. Utility Functions

```typescript
import {
  sanitizeHtmlContent,
  validateHtmlLength,
  getTextFromHtml,
  truncateHtml,
  isHtmlEmpty,
  sanitizeUserContent, // More restrictive
} from '@/utils/htmlSanitizer';

// Check if empty
if (isHtmlEmpty(content)) {
  throw new Error('Content cannot be empty');
}

// Get text only (for search, preview, etc)
const text = getTextFromHtml(content);
console.log(text); // Plain text without HTML tags

// Truncate for excerpt
const excerpt = truncateHtml(content, 200);

// Validate length
const isValid = validateHtmlLength(content, 10000);

// Strict sanitization (for user comments, etc)
const sanitized = sanitizeUserContent(userComment);
```

## 🛡️ Security Features

### Client-Side Sanitization (DOMPurify)

Editor menggunakan DOMPurify untuk sanitize content sebelum di-save:

```typescript
// Automatically applied in RichTextEditor component
const sanitized = DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', ...],
  ALLOWED_ATTR: ['href', 'src', 'alt', ...],
});
```

### Server-Side Sanitization (sanitize-html)

Backend menggunakan `sanitize-html` untuk additional security:

```typescript
// In htmlSanitizer.ts
export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...],
    allowedAttributes: {...},
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
```

**Important:** Selalu sanitize di server-side juga, jangan hanya rely pada client-side!

## 📝 Example: News Management System

### Frontend Component

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RichTextEditor } from '@/components/RichTextEditor';
import { FilePicker } from '@/components/FileManager';
import { FileItem } from '@/lib/stores/fileManagerStore';

const newsSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  slug: z.string().min(1, 'Slug required'),
  content: z.string().min(1, 'Content required'),
  excerpt: z.string().optional(),
  featuredImageId: z.string().optional(),
  status: z.enum(['draft', 'published']),
});

type NewsFormData = z.infer<typeof newsSchema>;

export default function NewsEditor() {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<FileItem | null>(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
    },
  });

  const onSubmit = async (data: NewsFormData) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');

      alert('News saved successfully!');
    } catch (error) {
      alert('Error saving news');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <h1>Create News Article</h1>

      {/* Title */}
      <div className="mb-3">
        <label>Title *</label>
        <input
          type="text"
          className="form-control"
          {...register('title')}
        />
        {errors.title && (
          <span className="text-danger">{errors.title.message}</span>
        )}
      </div>

      {/* Slug */}
      <div className="mb-3">
        <label>Slug *</label>
        <input
          type="text"
          className="form-control"
          {...register('slug')}
        />
        {errors.slug && (
          <span className="text-danger">{errors.slug.message}</span>
        )}
      </div>

      {/* Featured Image */}
      <div className="mb-3">
        <label>Featured Image</label>
        <div>
          {featuredImage ? (
            <div className="position-relative d-inline-block">
              <img
                src={featuredImage.thumbnails?.medium || featuredImage.url}
                alt={featuredImage.originalName}
                style={{ maxWidth: 300, height: 'auto' }}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                onClick={() => {
                  setFeaturedImage(null);
                  setValue('featuredImageId', undefined);
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowImagePicker(true)}
            >
              Select Image
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <label>Content *</label>
        <RichTextEditor
          value={watch('content')}
          onChange={(content) => setValue('content', content)}
          error={errors.content?.message}
          maxLength={50000}
          height={600}
          autoSave
          autoSaveKey="news-content-draft"
        />
      </div>

      {/* Excerpt */}
      <div className="mb-3">
        <label>Excerpt (Optional)</label>
        <RichTextEditor
          value={watch('excerpt') || ''}
          onChange={(excerpt) => setValue('excerpt', excerpt)}
          maxLength={500}
          height={200}
          placeholder="Brief summary..."
        />
      </div>

      {/* Status */}
      <div className="mb-3">
        <label>Status</label>
        <select className="form-select" {...register('status')}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Actions */}
      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
      </div>

      {/* Image Picker Modal */}
      <FilePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(files) => {
          if (files.length > 0) {
            setFeaturedImage(files[0]);
            setValue('featuredImageId', files[0].id);
          }
          setShowImagePicker(false);
        }}
        accept="images"
        multiple={false}
      />
    </form>
  );
}
```

### Backend API Route

```typescript
// backend/src/routes/newsRoutes.ts
import express from 'express';
import { z } from 'zod';
import { richTextWithLengthSchema } from '@/validations/richTextValidation';
import { sanitizeHtmlContent } from '@/utils/htmlSanitizer';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/middleware/auth';

const router = express.Router();

const createNewsSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: richTextWithLengthSchema(50000),
  excerpt: z.string().optional(),
  featuredImageId: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

// Create news
router.post('/', authenticate, async (req, res) => {
  try {
    const data = createNewsSchema.parse(req.body);

    const news = await prisma.news.create({
      data: {
        ...data,
        authorId: req.user.id,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        featuredImage: true,
      },
    });

    res.status(201).json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Failed to create news' });
  }
});

// Update news
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const data = createNewsSchema.parse(req.body);

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.status === 'published' && !news.publishedAt
            ? new Date()
            : news.publishedAt,
      },
    });

    res.json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating news:', error);
    res.status(500).json({ message: 'Failed to update news' });
  }
});

export default router;
```

## 🎯 Use Cases

### 1. News/Blog Editor
- Rich content dengan images dan formatting
- Auto-save drafts
- Featured image selection

### 2. Page Builder
- Landing pages
- About Us pages
- Dynamic content pages

### 3. Product Descriptions
- E-commerce product details
- Formatted descriptions dengan images

### 4. Announcements/Notices
- Company announcements
- System notifications
- Event descriptions

### 5. Email Templates
- Marketing emails
- Newsletter content
- Automated email content

## 🔧 Customization

### Custom Plugins

```tsx
<RichTextEditor
  plugins={[
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'searchreplace',
    'code',
    'fullscreen',
    'table',
    'emoticons', // Add emoticons
    'template', // Add templates
    'help',
    'wordcount',
  ]}
/>
```

### Custom Toolbar

```tsx
<RichTextEditor
  toolbar="undo redo | formatselect | bold italic underline strikethrough | \
    forecolor backcolor | alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | link image media table | \
    removeformat code fullscreen help"
/>
```

### Custom Styles

```css
/* In your CSS file */
.rich-text-editor .tox-tinymce {
  border: 2px solid #007bff;
  border-radius: 8px;
}

.rich-text-editor .tox-toolbar {
  background-color: #f8f9fa;
}
```

## 📚 Additional Resources

- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [sanitize-html Documentation](https://github.com/apostrophecms/sanitize-html)

## ⚠️ Important Notes

1. **Security**: Selalu sanitize HTML content di server-side, jangan hanya client-side
2. **Performance**: Untuk content sangat besar, consider lazy loading atau pagination
3. **TinyMCE API Key**: Untuk production, dapatkan API key dari tiny.cloud atau gunakan self-hosted
4. **Storage**: Auto-save menggunakan localStorage, pastikan tidak menyimpan data sensitif
5. **Validation**: Selalu validate max length di backend juga
6. **Image Upload**: File manager sudah handle upload, tapi pastikan ada file size limits

## 🐛 Troubleshooting

### Editor tidak muncul
- Pastikan TinyMCE sudah ter-install
- Check console untuk errors
- Pastikan component di-render di client-side (`'use client'`)

### Image tidak bisa di-insert
- Check file manager configuration
- Pastikan file picker modal berfungsi
- Verify image URLs accessible

### Auto-save tidak bekerja
- Check localStorage availability
- Verify autoSaveKey unique
- Check browser localStorage limits

### Content terlalu panjang
- Set maxLength yang sesuai
- Implement server-side validation
- Show character count indicator
