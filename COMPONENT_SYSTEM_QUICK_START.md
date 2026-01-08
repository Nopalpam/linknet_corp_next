# Component System - Quick Start Guide

## Overview

Advanced Component System memungkinkan Anda membuat halaman website dengan drag-drop component builder. Setiap component memiliki JSON schema untuk validation dan automatic form generation.

## ✅ Sudah Diimplementasikan

### Backend
- ✅ JSON schema validation dengan Ajv
- ✅ 4 core component types (Hero, Text Block, Image Gallery, CTA)
- ✅ Complete API endpoints untuk CRUD operations
- ✅ Drag-drop reorder support
- ✅ Visibility toggle
- ✅ RBAC permissions integration

### Frontend
- ✅ Drag-drop interface dengan @dnd-kit
- ✅ Component list dengan reordering
- ✅ Add component dropdown
- ✅ API client dan TypeScript types
- ✅ Integrated ke edit page

## 🚀 Setup

### 1. Run Migration
```bash
cd backend
npx prisma migrate dev --name add_component_system
npx prisma generate
```

### 2. Test the System

Navigate to edit page:
```
http://localhost:3000/cms/pages/[PAGE_ID]/edit
```

## 📦 Available Component Types

### 1. Hero Section
Banner utama dengan title, subtitle, background image, dan CTA button.

**Fields:**
- Title* (required)
- Subtitle
- Background Image (URL)
- CTA Button Text
- CTA Button Link

### 2. Text Block
Rich text content block untuk paragraphs, lists, dll.

**Fields:**
- Content* (HTML from WYSIWYG)

### 3. Image Gallery
Gallery of images dengan captions.

**Fields:**
- Images* (array)
  - Image URL*
  - Caption
  - Alt Text* (for accessibility)

### 4. Call to Action
Prominent CTA section dengan colored background.

**Fields:**
- Title*
- Description
- Button Text*
- Button Link*
- Background Color (hex)

## 🎯 Usage

### Add Component
1. Click "Add Component" dropdown di component builder
2. Select component type
3. Fill in required fields
4. Click "Save"

### Reorder Components
1. Drag component by the grip handle
2. Drop to desired position
3. Order auto-saves

### Edit Component
1. Click component to expand
2. Update fields
3. Click "Save" or auto-save on blur

### Hide/Show Component
1. Click eye icon on component
2. Hidden components won't appear on public site

### Delete Component
1. Click trash icon
2. Confirm deletion
3. Components below will reorder automatically

## 🔧 Add New Component Type

### Step 1: Create JSON Schema

File: `backend/src/schemas/components/my-component.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "My Component",
  "description": "Component description",
  "properties": {
    "field1": {
      "type": "string",
      "title": "Field 1",
      "description": "Field description",
      "minLength": 1,
      "maxLength": 200
    },
    "field2": {
      "type": "number",
      "title": "Field 2",
      "minimum": 0
    }
  },
  "required": ["field1"],
  "additionalProperties": false
}
```

### Step 2: Register Schema

File: `backend/src/schemas/components/index.ts`
```typescript
import myComponent from './my-component.json';

export const COMPONENT_SCHEMAS = {
  // ... existing
  'my-component': myComponent,
};

export const COMPONENT_TYPES = [
  // ... existing
  {
    type: 'my-component',
    name: 'My Component',
    description: 'Component description here',
    icon: 'FaIcon',
    category: 'Custom',
    schema: myComponent,
  },
];
```

### Step 3: Create React Component (optional)

File: `frontend/components/page-components/MyComponent.tsx`
```tsx
export default function MyComponent({ data }: { data: any }) {
  return (
    <div className="my-component">
      <h2>{data.field1}</h2>
      <p>{data.field2}</p>
    </div>
  );
}
```

### Step 4: Restart Server

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 📊 JSON Schema Field Types

### String Field
```json
{
  "fieldName": {
    "type": "string",
    "title": "Field Label",
    "description": "Help text",
    "minLength": 1,
    "maxLength": 100,
    "pattern": "^[a-zA-Z0-9]+$"
  }
}
```

### Number Field
```json
{
  "fieldName": {
    "type": "number",
    "title": "Field Label",
    "minimum": 0,
    "maximum": 100,
    "default": 50
  }
}
```

### Boolean Field
```json
{
  "fieldName": {
    "type": "boolean",
    "title": "Field Label",
    "default": false
  }
}
```

### Enum (Select) Field
```json
{
  "fieldName": {
    "type": "string",
    "title": "Field Label",
    "enum": ["option1", "option2", "option3"],
    "default": "option1"
  }
}
```

### Array Field
```json
{
  "items": {
    "type": "array",
    "title": "Items",
    "items": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "value": { "type": "number" }
      }
    },
    "minItems": 1,
    "maxItems": 10
  }
}
```

### Object (Nested) Field
```json
{
  "config": {
    "type": "object",
    "title": "Configuration",
    "properties": {
      "setting1": { "type": "string" },
      "setting2": { "type": "boolean" }
    },
    "required": ["setting1"]
  }
}
```

### URL Field
```json
{
  "url": {
    "type": "string",
    "title": "URL",
    "format": "uri"
  }
}
```

### Email Field
```json
{
  "email": {
    "type": "string",
    "title": "Email",
    "format": "email"
  }
}
```

### Color Field
```json
{
  "color": {
    "type": "string",
    "title": "Color",
    "pattern": "^#[0-9A-Fa-f]{6}$",
    "default": "#000000"
  }
}
```

### HTML Content Field
```json
{
  "content": {
    "type": "string",
    "title": "Content",
    "contentMediaType": "text/html"
  }
}
```

## 🎨 Component Categories

Organize components by category:
- **Layout** - Hero, Header, Footer, Grid
- **Content** - Text Block, Quote, Table
- **Media** - Image Gallery, Video, Audio
- **Marketing** - CTA, Testimonials, Pricing
- **Forms** - Contact Form, Newsletter, Survey
- **Data** - Stats, Charts, Tables
- **Navigation** - Menu, Breadcrumb, Tabs
- **Social** - Share Buttons, Feed, Reviews
- **Custom** - Custom HTML, Embed

## 🔒 Permissions Required

| Action | Permission |
|--------|-----------|
| View components | `pages_read` |
| Add component | `pages_create` |
| Edit component | `pages_update` |
| Delete component | `pages_delete` |
| Reorder components | `pages_update` |
| Toggle visibility | `pages_update` |

## 📝 API Examples

### Get Page Components
```bash
GET /api/v1/cms/pages/PAGE_ID/components
Authorization: Bearer TOKEN
```

### Create Component
```bash
POST /api/v1/cms/pages/PAGE_ID/components
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "componentType": "hero-section",
  "componentData": {
    "title": "Welcome",
    "subtitle": "To our website"
  }
}
```

### Update Component
```bash
PUT /api/v1/cms/pages/components/COMPONENT_ID
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "componentData": {
    "title": "Updated Title"
  }
}
```

### Reorder Components
```bash
POST /api/v1/cms/pages/PAGE_ID/components/reorder
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "components": [
    { "id": "comp-1", "order": 0 },
    { "id": "comp-2", "order": 1 }
  ]
}
```

### Toggle Visibility
```bash
POST /api/v1/cms/pages/components/COMPONENT_ID/toggle-visibility
Authorization: Bearer TOKEN
```

### Delete Component
```bash
DELETE /api/v1/cms/pages/components/COMPONENT_ID
Authorization: Bearer TOKEN
```

## 🐛 Troubleshooting

### Component not saving
- Check validation errors in console
- Verify required fields are filled
- Check schema definition

### Drag-drop not working
- Verify @dnd-kit packages installed
- Check browser console for errors
- Ensure page has multiple components

### Schema validation errors
- Check field types match schema
- Verify required fields present
- Review schema syntax

### Permission denied
- Check user has required permissions
- Verify JWT token valid
- Check role assignments

## 📚 Documentation

- [Complete Documentation](COMPONENT_SYSTEM_README.md)
- [Implementation Summary](COMPONENT_SYSTEM_SUMMARY.md)
- [Page Management Guide](PAGE_MANAGEMENT_QUICK_START.md)

## 🎉 Summary

Component system siap digunakan dengan:
- ✅ 4 component types implemented
- ✅ JSON schema validation
- ✅ Drag-drop reordering
- ✅ CRUD operations
- ✅ RBAC integration

Untuk add more component types, ikuti steps di atas. System designed untuk easy extension!
