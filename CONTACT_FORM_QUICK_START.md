# Contact Form Quick Start Guide

## Overview
Contact form system untuk public dengan rate limiting dan admin management.

## Database Schema

```prisma
model ContactUs {
  id          String        @id @default(uuid())
  firstName   String        @map("first_name")
  lastName    String        @map("last_name")
  email       String
  phone       String?
  role        String?
  company     String?
  inquiryType InquiryType   @map("inquiry_type")
  message     String        @db.Text
  ipAddress   String?       @map("ip_address")
  userAgent   String?       @map("user_agent") @db.Text
  submittedAt DateTime      @default(now()) @map("submitted_at")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([email])
  @@index([inquiryType])
  @@index([submittedAt])
  @@index([createdAt])
  @@map("contact_us")
}

enum InquiryType {
  BUSINESS
  SUPPORT
  CAREER
  OTHERS
}
```

## Setup Instructions

### 1. Database Migration

```bash
cd backend

# Generate migration
npx prisma migrate dev --name add_contact_us_table

# Or apply migration
npx prisma migrate deploy
```

### 2. Backend Setup

Backend sudah configured dengan:
- ✅ Controller: `src/controllers/contact.controller.ts`
- ✅ Routes: `src/routes/contact.routes.ts`
- ✅ Rate limiting: 3 requests per IP per hour
- ✅ Server integration: `src/server.ts`

### 3. Frontend Setup

Component sudah available di:
- ✅ Component: `components/public/ContactForm.tsx`

## API Endpoints

### Public Endpoint

#### Submit Contact Form
```http
POST /api/v1/contact-us/submit
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+62812345678",
  "role": "IT Manager",
  "company": "ABC Corp",
  "inquiryType": "BUSINESS",
  "message": "I would like to inquire about your services..."
}
```

**Rate Limit:** Max 3 requests per IP per hour

**Response (Success):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "data": {
    "id": "uuid-here",
    "submittedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

**Response (Rate Limit):**
```json
{
  "success": false,
  "message": "Too many submissions from this IP, please try again later."
}
```

### Admin Endpoints (Protected)

#### Get All Submissions
```http
GET /api/v1/contact-us?page=1&limit=10&inquiryType=BUSINESS&search=john
Authorization: Bearer <token>
```

**Required Permission:** `contact:read`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+62812345678",
      "role": "IT Manager",
      "company": "ABC Corp",
      "inquiryType": "BUSINESS",
      "message": "I would like to inquire...",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "submittedAt": "2026-01-19T10:30:00.000Z",
      "createdAt": "2026-01-19T10:30:00.000Z",
      "updatedAt": "2026-01-19T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Get Submission by ID
```http
GET /api/v1/contact-us/:id
Authorization: Bearer <token>
```

**Required Permission:** `contact:read`

#### Delete Submission
```http
DELETE /api/v1/contact-us/:id
Authorization: Bearer <token>
```

**Required Permission:** `contact:delete`

## Frontend Usage

### 1. Using in Dynamic Pages (CMS)

Contact form sudah tersedia sebagai component type di CMS page builder:
- Type: `contact_form`
- Props: `title`, `description`, `show_title`

### 2. Using in Custom Pages

```tsx
import ContactForm from '@/components/public/ContactForm';

export default function ContactPage() {
  return (
    <ContactForm
      data={{
        title: 'Get in Touch',
        description: 'We would love to hear from you',
        show_title: true,
      }}
    />
  );
}
```

### 3. Form Features

- ✅ First Name & Last Name (required)
- ✅ Email (required, validated)
- ✅ Phone (optional)
- ✅ Role (optional)
- ✅ Company (optional)
- ✅ Inquiry Type (required dropdown)
  - Business Inquiry
  - Technical Support
  - Career Opportunities
  - Others
- ✅ Message (required, textarea)
- ✅ Success/Error messages
- ✅ Loading state during submission
- ✅ Form reset after successful submission

## Environment Variables

Pastikan `NEXT_PUBLIC_API_URL` sudah set di frontend `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## RBAC Permissions

Untuk admin access, tambahkan permissions ini ke role:

```typescript
{
  resource: 'contact',
  actions: ['read', 'delete']
}
```

### Add Permissions via Seed/Migration

```sql
-- Add contact permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'super-admin'
AND p.resource = 'contact'
AND p.action IN ('read', 'delete');
```

## Testing

### 1. Test Public Submission

```bash
curl -X POST http://localhost:5000/api/v1/contact-us/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "inquiryType": "BUSINESS",
    "message": "Test message"
  }'
```

### 2. Test Rate Limiting

Kirim 4 requests berturut-turut dari IP yang sama untuk memicu rate limit.

### 3. Test Admin Access

```bash
# Login first
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linknet.com","password":"your-password"}' \
  | jq -r '.data.access_token')

# Get all submissions
curl -X GET http://localhost:5000/api/v1/contact-us \
  -H "Authorization: Bearer $TOKEN"
```

## Monitoring

Contact submissions will be logged in:
- Database: `contact_us` table
- Backend logs: Check for contact form submissions
- IP addresses and user agents are tracked for security

## Security Features

1. **Rate Limiting**: 3 submissions per IP per hour
2. **Input Validation**: All fields validated server-side
3. **Email Format**: Regex validation for email
4. **IP Tracking**: Track submission origin
5. **User Agent**: Track browser/device info
6. **RBAC**: Admin endpoints protected with permissions

## Customization

### Change Rate Limit

Edit [contact.controller.ts](../backend/src/controllers/contact.controller.ts#L7-L16):

```typescript
export const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Change time window
  max: 3, // Change max requests
  // ...
});
```

### Add Email Notification

Tambahkan email service di controller setelah save to database:

```typescript
// After prisma.contactUs.create()
await emailService.sendContactNotification({
  to: 'admin@linknet.com',
  submission: contactSubmission,
});
```

### Custom Fields

1. Update Prisma schema
2. Run migration
3. Update controller validation
4. Update frontend form

## Troubleshooting

### Rate Limit Not Working
- Check if IP is correctly detected
- Verify middleware order in routes
- Check if rate limiter is using memory (consider Redis for production)

### Form Not Submitting
- Check NEXT_PUBLIC_API_URL in frontend .env
- Verify CORS settings in backend
- Check browser console for errors

### Admin Can't Access
- Verify user has `contact:read` permission
- Check JWT token is valid
- Verify RBAC middleware is working

## Production Considerations

1. **Rate Limiter Storage**: Use Redis instead of memory
   ```typescript
   import RedisStore from 'rate-limit-redis';
   import { redis } from '../config/redis';
   
   export const contactRateLimiter = rateLimit({
     store: new RedisStore({
       client: redis,
       prefix: 'rl:contact:',
     }),
     // ...
   });
   ```

2. **Email Notifications**: Setup email service for new submissions

3. **Analytics**: Track conversion rates and inquiry types

4. **Data Retention**: Implement cleanup for old submissions

5. **Export Feature**: Add CSV/Excel export for admin

## Next Steps

1. ✅ Database migration applied
2. ✅ Backend API ready
3. ✅ Frontend component ready
4. 🔄 Add RBAC permissions for admin access
5. 🔄 Test rate limiting
6. 🔄 Setup email notifications (optional)
7. 🔄 Add admin dashboard for managing submissions

## Support

For issues or questions, check:
- Backend logs: `backend/logs/`
- Database: Check `contact_us` table
- Frontend console: Browser dev tools
