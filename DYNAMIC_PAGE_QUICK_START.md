# Dynamic Page Rendering - Quick Start

## 🚀 Setup in 5 Minutes

### 1. Environment Variables

**Backend** (`.env`):
```bash
# Secrets
PREVIEW_SECRET=change-this-to-random-string
REVALIDATE_SECRET=another-random-string

# Next.js URL
NEXTJS_URL=http://localhost:3000
```

**Frontend** (`.env.local`):
```bash
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Secrets (must match backend)
NEXT_PUBLIC_PREVIEW_SECRET=change-this-to-random-string
REVALIDATE_SECRET=another-random-string
```

### 2. Install Dependencies

Both `framer-motion` and dependencies already installed ✅

### 3. Start Servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 4. Create Your First Page

1. **Login** to CMS: `http://localhost:3000/cms/pages`

2. **Create page**:
   - Title: "About Us"
   - Slug: "about-us"
   - Status: "DRAFT"
   - Click "Create"

3. **Edit page** → Add components:
   - Add "Hero Section":
     - Title: "Welcome to LinkNet Corp"
     - Subtitle: "Best Internet Service Provider"
     - Background Image: "/images/hero.jpg"
   
   - Add "Text Block":
     - Content: "<p>We provide fast and reliable internet...</p>"

4. **Preview** (while draft):
   ```
   http://localhost:3000/pages/preview/about-us?secret=YOUR_PREVIEW_SECRET
   ```

5. **Publish**:
   - Change status to "PUBLISHED"
   - Click "Save"
   - Click "Revalidate" button

6. **View live page**:
   ```
   http://localhost:3000/page/about-us
   OR
   http://localhost:3000/about-us
   ```

## 📋 Common Tasks

### Add Component to Page

```typescript
// In page edit screen
1. Click "Add Component" dropdown
2. Select component type (e.g., "Call to Action")
3. Fill form
4. Click "Add Component"
5. Drag to reorder if needed
```

### Preview Draft Page

```typescript
URL: /pages/preview/[slug]?secret=YOUR_SECRET

Example:
http://localhost:3000/pages/preview/new-page?secret=abc123
```

### Revalidate After Update

**Option 1**: Click "Revalidate" button in CMS

**Option 2**: API call
```bash
curl -X POST http://localhost:5000/api/v1/cms/pages/PAGE_ID/revalidate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Option 3**: Automatic (configure webhook)

### Change Page URL

```typescript
// In page edit
1. Change slug field: "old-slug" → "new-slug"
2. Save
3. Revalidate
4. Old URL will 404, new URL works
```

## 🎨 Component Examples

### Hero Section
```json
{
  "title": "Welcome",
  "subtitle": "Your tagline here",
  "backgroundImage": "/images/hero.jpg",
  "ctaText": "Get Started",
  "ctaLink": "/contact"
}
```

### Pricing Table
```json
{
  "plans": [
    {
      "name": "Basic",
      "price": 100000,
      "currency": "Rp",
      "period": "/month",
      "features": ["10 Mbps", "Unlimited", "24/7 Support"],
      "cta_url": "/subscribe"
    }
  ],
  "columns": 3
}
```

### Testimonials (Carousel)
```json
{
  "items": [
    {
      "name": "John Doe",
      "position": "CEO",
      "company": "Acme Inc",
      "quote": "Excellent service!",
      "rating": 5
    }
  ],
  "layout": "carousel"
}
```

## 🔍 URL Structure

```
Public Pages:
  /page/about-us     ← Primary route (recommended)
  /about-us          ← Catch-all fallback

Preview:
  /pages/preview/about-us?secret=xxx

CMS:
  /cms/pages         ← Manage pages
  /cms/pages/create  ← Create page
  /cms/pages/:id/edit ← Edit page
```

## ⚡ Performance Tips

1. **Use /page/ prefix** for SEO:
   ```
   ✅ /page/about-us
   ❌ /about-us
   ```

2. **Revalidate after updates**:
   - Ensures fresh content
   - Clears ISR cache

3. **Optimize images**:
   - Use next/image component
   - Set proper width/height
   - Enable lazy loading

4. **Keep components lightweight**:
   - Avoid heavy computations
   - Use memoization

## 🐛 Troubleshooting

### Page shows old content
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Preview not working
```
1. Check PREVIEW_SECRET matches in .env files
2. Verify secret in URL query param
3. Check browser console for errors
```

### 404 on published page
```
1. Verify status is "PUBLISHED"
2. Check slug is correct
3. Revalidate the page
4. Restart Next.js server
```

### Components not rendering
```
1. Check isVisible is true
2. Verify component data matches schema
3. Check browser console for errors
4. Verify component type exists
```

## 📊 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
# Generate static pages
npm run build

# Start production server
npm run start
```

### Deploy to Vercel
```bash
vercel deploy --prod
```

**Environment variables** on Vercel:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_PREVIEW_SECRET`
- `REVALIDATE_SECRET`

## 🔗 API Endpoints

```typescript
// Get published page
GET /api/pages/:slug

// Get preview
GET /api/pages/preview/:slug?secret=xxx

// Get all slugs (for build)
GET /api/pages/slugs

// Trigger revalidation
POST /api/cms/pages/:id/revalidate
```

## 📱 Testing Checklist

- [ ] Create draft page
- [ ] Preview draft page with secret
- [ ] Publish page
- [ ] Access via /page/[slug]
- [ ] Access via /[slug]
- [ ] Add components (min 3 types)
- [ ] Reorder components
- [ ] Hide component
- [ ] Revalidate page
- [ ] Test 404 page
- [ ] Test on mobile
- [ ] Check page speed
- [ ] Verify SEO meta tags

## 🎯 Next Steps

1. ✅ System fully functional
2. Create more pages with different templates
3. Test all 13 component types
4. Configure custom domain
5. Setup CDN for images
6. Add Google Analytics
7. Setup automated sitemap generation

---

**Time to First Page**: ~5 minutes  
**Documentation**: [DYNAMIC_PAGE_RENDERING_GUIDE.md](./DYNAMIC_PAGE_RENDERING_GUIDE.md)  
**Version**: 1.0.0
