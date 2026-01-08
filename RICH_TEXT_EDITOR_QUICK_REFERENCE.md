# Rich Text Editor - Quick Reference

## 📦 Installation

```bash
# Frontend
cd frontend
npm install @tinymce/tinymce-react dompurify

# Backend
cd backend
npm install sanitize-html @types/sanitize-html
```

## 🚀 Basic Usage

```tsx
import { RichTextEditor } from '@/components/RichTextEditor';

<RichTextEditor
  value={content}
  onChange={setContent}
  maxLength={10000}
  autoSave
  autoSaveKey="my-draft"
/>
```

## 🎯 With React Hook Form

```tsx
const { setValue, watch } = useForm();

<RichTextEditor
  value={watch('content')}
  onChange={(content) => setValue('content', content)}
  error={errors.content?.message}
/>
```

## 🔒 Backend Sanitization

```typescript
import { sanitizeHtmlContent } from '@/utils/htmlSanitizer';
import { richTextWithLengthSchema } from '@/validations/richTextValidation';

// Method 1: Manual sanitization
const sanitized = sanitizeHtmlContent(req.body.content);

// Method 2: With Zod validation
const schema = z.object({
  content: richTextWithLengthSchema(50000),
});
```

## 🎨 File Manager Integration

Editor sudah terintegrasi otomatis dengan file manager:
1. Klik button "Image" di toolbar
2. Select image dari file manager
3. Image otomatis ter-insert ke editor

## 📝 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `''` | Editor content |
| `onChange` | `(content: string) => void` | - | Change handler |
| `maxLength` | `number` | - | Max character limit |
| `autoSave` | `boolean` | `false` | Enable auto-save |
| `autoSaveKey` | `string` | - | localStorage key |
| `height` | `number` | `500` | Editor height (px) |
| `disabled` | `boolean` | `false` | Disable editor |
| `error` | `string` | - | Error message |

## 🛡️ Security Utilities

```typescript
// Sanitize HTML
sanitizeHtmlContent(html);

// Get plain text
getTextFromHtml(html);

// Check if empty
isHtmlEmpty(html);

// Truncate HTML
truncateHtml(html, 200);

// Strict sanitization
sanitizeUserContent(html);
```

## 📚 See Full Documentation

- [RICH_TEXT_EDITOR_GUIDE.md](./RICH_TEXT_EDITOR_GUIDE.md) - Complete guide dengan examples
- [FILE_MANAGER_QUICK_START.md](./FILE_MANAGER_QUICK_START.md) - File manager integration
