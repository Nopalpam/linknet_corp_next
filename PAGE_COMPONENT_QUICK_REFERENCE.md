# Page & Component Management System - Quick Reference

## 📋 Table of Contents
1. [Page Management](#page-management)
2. [Component System](#component-system)
3. [API Reference](#api-reference)
4. [Component Types](#component-types)

---

## Page Management

### Create Page
```typescript
POST /api/cms/pages
{
  "title": "About Us",
  "slug": "about-us",
  "content": "<p>Content here</p>",
  "template": "Page",
  "status": "DRAFT",
  "metaTitle": "About Us - LinkNet Corp",
  "metaDescription": "Learn about LinkNet Corp",
  "metaKeywords": ["about", "company"],
  "ogImage": "/images/og-about.jpg"
}
```

### Update Page
```typescript
PUT /api/cms/pages/:id
{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

### Get Pages (List)
```typescript
GET /api/cms/pages?page=1&limit=10&search=about&status=PUBLISHED&template=Page
```

### Get Single Page
```typescript
GET /api/cms/pages/:id
```

### Delete Page
```typescript
DELETE /api/cms/pages/:id
```

---

## Component System

### Get Component Types
```typescript
GET /api/components/types

Response:
{
  "success": true,
  "data": [
    {
      "type": "hero-section",
      "name": "Hero Section",
      "description": "...",
      "icon": "FaImage",
      "category": "Layout",
      "schema": { ... }
    }
  ]
}
```

### Get Page Components
```typescript
GET /api/pages/:pageId/components?includeHidden=false

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "hero-section",
      "data": { ... },
      "order": 1,
      "isVisible": true
    }
  ]
}
```

### Create Component
```typescript
POST /api/pages/:pageId/components
{
  "componentType": "hero-section",
  "componentData": {
    "title": "Welcome",
    "subtitle": "Best service"
  },
  "order": 1,
  "isVisible": true
}
```

### Update Component
```typescript
PUT /api/components/:id
{
  "componentData": {
    "title": "Updated Title"
  }
}
```

### Reorder Components
```typescript
PUT /api/components/reorder
{
  "components": [
    { "id": "uuid1", "order": 1 },
    { "id": "uuid2", "order": 2 }
  ]
}
```

### Toggle Visibility
```typescript
PUT /api/components/:id/visibility
{
  "isVisible": false
}
```

### Delete Component
```typescript
DELETE /api/components/:id
```

---

## Component Types

### 1. Hero Section (`hero-section`)
```json
{
  "title": "Welcome to LinkNet",
  "subtitle": "Best Internet Service",
  "backgroundImage": "/images/hero.jpg",
  "ctaText": "Get Started",
  "ctaLink": "/contact"
}
```

### 2. Text Block (`text-block`)
```json
{
  "content": "<p>Rich text HTML content</p>"
}
```

### 3. Image Gallery (`image-gallery`)
```json
{
  "images": [
    {
      "url": "/images/photo1.jpg",
      "caption": "Photo caption",
      "alt": "Alt text"
    }
  ]
}
```

### 4. Call to Action (`call-to-action`)
```json
{
  "title": "Ready to Get Started?",
  "description": "Contact us today",
  "buttonText": "Contact Us",
  "buttonLink": "/contact",
  "backgroundColor": "#007bff"
}
```

### 5. Video Embed (`video-embed`)
```json
{
  "video_url": "https://youtube.com/watch?v=...",
  "poster_image": "/images/video-thumb.jpg",
  "caption": "Watch our video",
  "autoplay": false,
  "controls": true
}
```

### 6. Accordion (`accordion`)
```json
{
  "items": [
    {
      "title": "Question 1",
      "content": "<p>Answer here</p>",
      "is_open": false
    }
  ],
  "allow_multiple": false
}
```

### 7. Tabs (`tabs`)
```json
{
  "tabs": [
    {
      "title": "Tab 1",
      "content": "<p>Tab content</p>",
      "icon": "fa fa-home"
    }
  ],
  "style": "tabs"
}
```

### 8. Testimonials (`testimonials`)
```json
{
  "items": [
    {
      "name": "John Doe",
      "position": "CEO",
      "company": "Acme Inc",
      "photo": "/images/john.jpg",
      "quote": "Great service!",
      "rating": 5
    }
  ],
  "layout": "carousel",
  "columns": 3
}
```

### 9. Team Grid (`team-grid`)
```json
{
  "members": [
    {
      "name": "John Doe",
      "position": "CEO",
      "photo": "/images/john.jpg",
      "bio": "Bio text",
      "email": "john@example.com",
      "phone": "+1234567890",
      "social_links": {
        "linkedin": "https://linkedin.com/in/johndoe",
        "twitter": "https://twitter.com/johndoe"
      }
    }
  ],
  "columns": 4
}
```

### 10. Stats Counter (`stats-counter`)
```json
{
  "stats": [
    {
      "number": 1000,
      "label": "Happy Customers",
      "icon": "fa fa-users",
      "suffix": "+",
      "prefix": ""
    }
  ],
  "animate": true,
  "columns": 4
}
```

### 11. Pricing Table (`pricing-table`)
```json
{
  "plans": [
    {
      "name": "Basic",
      "price": 100000,
      "currency": "Rp",
      "period": "/month",
      "description": "Basic plan",
      "features": ["10 Mbps", "Unlimited", "24/7 Support"],
      "is_featured": false,
      "cta_text": "Subscribe",
      "cta_url": "/subscribe"
    }
  ],
  "columns": 3
}
```

### 12. Contact Form (`contact-form`)
```json
{
  "form_id": "contact-us",
  "title": "Get in Touch",
  "description": "Fill the form below",
  "show_title": true,
  "success_message": "Thank you!"
}
```

### 13. Latest News (`latest-news`)
```json
{
  "title": "Latest News",
  "category_id": "",
  "limit": 6,
  "layout": "grid",
  "columns": 3,
  "show_excerpt": true,
  "show_date": true,
  "show_author": false
}
```

### 14. Custom HTML (`custom-html`)
```json
{
  "html_content": "<div>Custom HTML</div>",
  "container_class": "my-custom-class",
  "enable_scripts": false
}
```

---

## Frontend Usage

### Import Components
```typescript
import { ComponentBuilder } from '@/components/cms/ComponentBuilder';
import { getPageComponents } from '@/lib/api/components';
```

### Use ComponentBuilder
```tsx
<ComponentBuilder 
  pageId={page.id}
  initialComponents={components}
/>
```

### Load Components
```typescript
const { data, error, mutate } = useSWR(
  `/pages/${pageId}/components`,
  () => getPageComponents(pageId)
);
```

---

## Database Schema

### Page Model
```prisma
model Page {
  id              String          @id @default(uuid())
  title           String
  slug            String          @unique
  content         String?         @db.Text
  template        PageTemplate    @default(Page)
  status          PageStatus      @default(DRAFT)
  metaTitle       String?
  metaDescription String?         @db.Text
  metaKeywords    String[]
  ogImage         String?
  createdBy       String
  user            User            @relation(...)
  components      PageComponent[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

### PageComponent Model
```prisma
model PageComponent {
  id             String   @id @default(uuid())
  pageId         String
  page           Page     @relation(...)
  component_type String
  component_data Json
  order          Int      @default(0)
  isVisible      Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([pageId])
  @@index([order])
}
```

---

## Permissions (RBAC)

### Page Permissions
- `pages_read` - View pages
- `pages_create` - Create pages
- `pages_update` - Edit pages
- `pages_delete` - Delete pages

### Component Permissions
Components use same permissions as pages:
- `pages_read` - View components
- `pages_create` - Create components
- `pages_update` - Edit components
- `pages_delete` - Delete components

---

## CLI Commands

### Install Dependencies
```bash
# Backend
cd backend
npm install ajv ajv-formats slugify

# Frontend
cd frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities framer-motion react-tagsinput
```

### Database Migration
```bash
cd backend
npx prisma migrate dev --name add_page_components
npx prisma generate
```

### Development
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## Validation

### JSON Schema Validation
All component data validated using Ajv:
- Required fields check
- Type validation (string, number, boolean, array, object)
- Format validation (uri, email)
- Enum validation
- Min/Max validation

### Example Error Response
```json
{
  "success": false,
  "message": "Invalid component data",
  "errors": [
    {
      "field": "title",
      "message": "must have required property 'title'"
    }
  ]
}
```

---

## Performance Tips

1. **Pagination**: Load pages in batches
   ```typescript
   GET /api/cms/pages?page=1&limit=20
   ```

2. **Optimistic Updates**: Use SWR mutate
   ```typescript
   mutate('/pages/123/components', updatedData, false);
   ```

3. **Caching**: SWR auto-caches responses
   ```typescript
   const { data } = useSWR(key, fetcher, {
     revalidateOnFocus: false,
     dedupingInterval: 60000
   });
   ```

4. **Lazy Loading**: Load components on demand
   ```typescript
   const ComponentItem = dynamic(() => import('./ComponentItem'));
   ```

---

## Troubleshooting

### Component Not Showing
1. Check `isVisible` is `true`
2. Verify component data matches schema
3. Check console for validation errors

### Drag-Drop Not Working
1. Ensure @dnd-kit packages installed
2. Check DndContext wraps SortableContext
3. Verify useSortable hook in items

### Form Not Saving
1. Check network tab for API errors
2. Verify authentication token
3. Check schema validation errors
4. Ensure required fields filled

### Slug Already Exists
1. Page slugs must be unique
2. Check existing pages
3. Use different slug or add suffix

---

## Security Notes

1. **Sanitize HTML**: Always sanitize user HTML input
2. **RBAC**: All routes protected by permissions
3. **Authentication**: JWT token required
4. **Validation**: Server-side validation enforced
5. **XSS Prevention**: Escape user content
6. **CSRF**: Include CSRF token in requests

---

## Migration from Old System

### Export Pages
```sql
SELECT * FROM old_pages 
ORDER BY created_at DESC;
```

### Import to New System
```typescript
for (const oldPage of oldPages) {
  await createPage({
    title: oldPage.title,
    slug: oldPage.slug,
    content: oldPage.content,
    status: oldPage.published ? 'PUBLISHED' : 'DRAFT'
  });
}
```

---

## Related Documentation

- [PAGE_MANAGEMENT_README.md](./PAGE_MANAGEMENT_README.md) - Detailed page management guide
- [COMPONENT_SYSTEM_QUICK_START.md](./COMPONENT_SYSTEM_QUICK_START.md) - Component system tutorial
- [COMPONENT_SYSTEM_COMPLETION.md](./COMPONENT_SYSTEM_COMPLETION.md) - Implementation summary
- [RBAC_README.md](./RBAC_README.md) - Permissions setup
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Full API reference

---

**Last Updated**: 2024  
**Version**: 1.0.0
