# Page Builder Testing Guide

## Backend Status
✅ **Backend is now running successfully on http://localhost:5000**

All TypeScript compilation errors have been fixed. The server is ready for testing.

## How to Test Page Builder

### 1. Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:3000

### 2. Login to CMS
1. Navigate to http://localhost:3000/cms/login
2. Login with admin credentials

### 3. Access Page Builder
1. Go to **CMS > Pages** (http://localhost:3000/cms/pages)
2. Click on any page to edit
3. Click the **"Page Builder"** button
4. You will be redirected to `/cms/pages/[id]/builder`

### 4. Test Page Builder Features

#### A. Add New Component
1. Click on any component type from the left sidebar:
   - Hero Section
   - Text Content
   - Image
   - Video
   - Button
   - Card Grid
   - Accordion
   - Tabs
   - Form
   - Testimonials
   - Call to Action
2. Component should appear in the preview canvas

#### B. Edit Component
1. Click on a component in the canvas
2. Monaco Editor will open on the right side
3. Edit the JSON configuration
4. Click **"Save Changes"** button
5. Preview should update automatically

#### C. Drag and Drop Reorder
1. Hover over a component
2. Click and drag the component
3. Drop it in a new position
4. Order should be saved automatically

#### D. Delete Component
1. Hover over a component
2. Click the **trash icon** (🗑️)
3. Confirm deletion
4. Component should be removed

#### E. Duplicate Component
1. Hover over a component
2. Click the **copy icon** (📋)
3. Duplicate component should appear below

#### F. Toggle Visibility
1. Hover over a component
2. Click the **eye icon** (👁️)
3. Component visibility should toggle

### 5. API Endpoints Testing

All endpoints are protected with RBAC. You need admin authentication.

#### Get All Components for a Page
```http
GET /api/cms/pages/:pageId/components
Authorization: Bearer <token>
```

#### Create New Component
```http
POST /api/cms/pages/:pageId/components
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "HERO",
  "componentData": {
    "title": "Welcome",
    "subtitle": "To our website",
    "backgroundImage": "/images/hero.jpg",
    "ctaText": "Learn More",
    "ctaLink": "/about"
  },
  "order": 0,
  "isVisible": true
}
```

#### Update Component
```http
PUT /api/cms/pages/components/:componentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "HERO",
  "componentData": {
    "title": "Updated Title"
  }
}
```

#### Delete Component
```http
DELETE /api/cms/pages/components/:componentId
Authorization: Bearer <token>
```

#### Reorder Components
```http
PUT /api/cms/pages/:pageId/components/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "componentOrders": [
    { "id": "comp-1", "order": 0 },
    { "id": "comp-2", "order": 1 },
    { "id": "comp-3", "order": 2 }
  ]
}
```

#### Duplicate Component
```http
POST /api/cms/pages/components/:componentId/duplicate
Authorization: Bearer <token>
```

#### Toggle Component Visibility
```http
PUT /api/cms/pages/components/:componentId/toggle
Authorization: Bearer <token>
```

#### Bulk Delete Components
```http
POST /api/cms/pages/:pageId/components/bulk-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "componentIds": ["comp-1", "comp-2", "comp-3"]
}
```

## Component Type Templates

Each component type has a predefined template that you can customize:

### 1. HERO
```json
{
  "title": "Main Heading",
  "subtitle": "Supporting text",
  "backgroundImage": "/images/hero.jpg",
  "ctaText": "Call to Action",
  "ctaLink": "/contact"
}
```

### 2. TEXT
```json
{
  "content": "<p>Your HTML content here</p>",
  "alignment": "left"
}
```

### 3. IMAGE
```json
{
  "src": "/images/photo.jpg",
  "alt": "Image description",
  "caption": "Image caption",
  "width": "100%"
}
```

### 4. VIDEO
```json
{
  "src": "https://youtube.com/watch?v=...",
  "provider": "youtube",
  "autoplay": false,
  "controls": true
}
```

### 5. BUTTON
```json
{
  "text": "Click Me",
  "link": "/page",
  "variant": "primary",
  "size": "md"
}
```

### 6. CARD_GRID
```json
{
  "cards": [
    {
      "title": "Card Title",
      "description": "Card description",
      "image": "/images/card.jpg",
      "link": "/page"
    }
  ],
  "columns": 3
}
```

### 7. ACCORDION
```json
{
  "items": [
    {
      "title": "Section 1",
      "content": "Content for section 1"
    }
  ]
}
```

### 8. TABS
```json
{
  "tabs": [
    {
      "title": "Tab 1",
      "content": "Content for tab 1"
    }
  ]
}
```

### 9. FORM
```json
{
  "fields": [
    {
      "name": "email",
      "label": "Email",
      "type": "email",
      "required": true
    }
  ],
  "submitText": "Submit",
  "action": "/api/submit"
}
```

### 10. TESTIMONIALS
```json
{
  "testimonials": [
    {
      "name": "John Doe",
      "role": "CEO",
      "content": "Great service!",
      "avatar": "/images/avatar.jpg"
    }
  ]
}
```

### 11. CTA (Call to Action)
```json
{
  "title": "Ready to get started?",
  "description": "Join us today",
  "primaryButton": {
    "text": "Get Started",
    "link": "/signup"
  },
  "secondaryButton": {
    "text": "Learn More",
    "link": "/about"
  }
}
```

## Troubleshooting

### Backend not running
```bash
cd backend
npm run dev
```

### Frontend not connecting to API
Check if backend is running on port 5000 and frontend proxy is configured correctly.

### Component not saving
1. Check browser console for errors
2. Verify JWT token is valid
3. Check backend logs for API errors

### Drag and drop not working
1. Verify @hello-pangea/dnd is installed
2. Check browser console for DnD errors
3. Refresh the page

## Fixed Issues

During implementation, the following issues were fixed:
- ✅ TypeScript compilation errors in contact controllers
- ✅ logError function signature issues
- ✅ Import statement corrections (authenticate → authMiddleware)
- ✅ Promise<void> return type conflicts with response objects

## Database Schema

The Page Builder uses these tables:

### pages
- id (String, PK)
- title (String)
- slug (String, unique)
- content (Text)
- status (Enum: DRAFT, PUBLISHED, ARCHIVED)
- createdAt (DateTime)
- updatedAt (DateTime)

### page_components
- id (String, PK)
- pageId (String, FK → pages.id)
- type (Enum: HERO, TEXT, IMAGE, VIDEO, BUTTON, CARD_GRID, ACCORDION, TABS, FORM, TESTIMONIALS, CTA)
- componentData (Json)
- order (Int)
- isVisible (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

---

**Status: ✅ Ready for Testing**

All backend errors have been resolved. The Page Builder feature is fully implemented and ready to use.
