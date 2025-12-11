# User Profile Management Documentation

## Overview

Complete user profile management system for current user with backend APIs and frontend UI.

## Backend API Endpoints

### 1. GET /api/profile
Get current user profile with roles and permissions.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "avatar": "https://...",
    "phone": "+1234567890",
    "status": "ACTIVE",
    "emailVerified": true,
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "roles": [
      {
        "id": "uuid",
        "name": "Admin",
        "slug": "admin",
        "description": "Administrator role"
      }
    ],
    "permissions": ["user.create", "user.update", "user.delete"],
    "twoFactorEnabled": false
  }
}
```

### 2. PUT /api/profile
Update current user profile (name, email, phone).

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890"
}
```

**Features:**
- If email changes: sets `email_verified_at` to null and sends verification email
- Validates email uniqueness
- Logs activity

### 3. PUT /api/profile/avatar
Upload/update user avatar.

**Authentication:** Required

**Request:** multipart/form-data
- Field: `avatar` (file)
- Max size: 2MB
- Allowed formats: JPG, PNG, WebP

**Process:**
1. Validates image
2. Processes with Sharp (resize to 400x400, convert to WebP)
3. Uploads to Azure Blob Storage (or local fallback)
4. Deletes old avatar
5. Updates user record

**Response:**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    "avatar": "https://...",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. DELETE /api/profile/avatar
Delete user avatar.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

### 5. PUT /api/profile/password
Change user password.

**Authentication:** Required

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Validation:**
- Current password must be correct
- New password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)
- New password must differ from current password
- Passwords must match

**Features:**
- Revokes all refresh tokens (forces logout on all devices)
- Logs activity

### 6. DELETE /api/profile
Delete user account (soft delete).

**Authentication:** Required

**Request Body:**
```json
{
  "password": "UserPass123!",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Process:**
1. Verifies password
2. Soft deletes user (sets `deletedAt`, status to INACTIVE)
3. Revokes all refresh tokens
4. Deletes avatar from storage
5. Logs activity
6. Sends goodbye email (TODO)

## Frontend Implementation

### Route: `/cms/profile`

Profile page with 3 tabs:

#### 1. General Tab
- **Avatar Upload**
  - Drag & drop or click to upload
  - Preview before upload
  - Crop tool with zoom control
  - Auto-converts to WebP
  - Max 2MB validation
  - Displays current avatar
  - Delete avatar option

- **Profile Form**
  - First Name
  - Last Name
  - Email (shows verification status)
  - Phone Number
  - Username (read-only)

#### 2. Security Tab
- **Change Password**
  - Current password
  - New password with strength requirements
  - Confirm password
  - Real-time validation

- **Two-Factor Authentication** (Coming Soon)
  - Status display
  - Configure button (disabled)

- **Active Sessions** (Coming Soon)
  - Session management info

#### 3. Danger Zone Tab
- **Delete Account**
  - Warning messages
  - Confirmation modal
  - Password verification
  - Type "DELETE MY ACCOUNT" confirmation
  - Lists consequences

## Components

### 1. `AvatarUpload.tsx`
Avatar upload with crop functionality.

**Features:**
- React Dropzone for drag & drop
- React Easy Crop for image cropping
- Round crop shape
- Zoom slider
- Preview overlay on hover
- Client-side validation
- Progress indicators

### 2. `GeneralTab.tsx`
Profile information editing.

**Features:**
- React Hook Form with Zod validation
- Avatar management integration
- Email verification status
- Success/error alerts
- Dirty state detection

### 3. `SecurityTab.tsx`
Password and security settings.

**Features:**
- Password change form
- Complex validation rules
- 2FA status display
- Session management info

### 4. `DangerZoneTab.tsx`
Account deletion.

**Features:**
- Confirmation modal
- Password verification
- Text confirmation ("DELETE MY ACCOUNT")
- Warning messages
- Auto-redirect after deletion

## Hooks

### `useProfile.ts`
SWR hook for profile data fetching and caching.

**Usage:**
```typescript
const { profile, isLoading, error, mutate } = useProfile();
```

**Features:**
- Automatic caching
- Revalidation control
- Error handling
- Manual revalidation

## Validation Schemas

### Backend (Zod)

**`profile.validator.ts`**
- `updateProfileSchema`: Profile update validation
- `changePasswordSchema`: Password change validation
- `deleteAccountSchema`: Account deletion validation

### Frontend (Zod + React Hook Form)

Similar schemas in component files with `@hookform/resolvers/zod`.

## File Upload & Processing

### `upload.ts`
Multer configuration for file uploads.

**Features:**
- Memory storage
- File type filtering
- Size limit (2MB)
- Error message formatting

### `image.util.ts`
Image processing with Sharp.

**Functions:**
- `processAvatarImage()`: Resize to 400x400, convert to WebP
- `validateImage()`: Check dimensions and format
- `getImageMetadata()`: Get image info

### `storage.util.ts`
Azure Blob Storage integration.

**Functions:**
- `uploadToAzureBlob()`: Upload to cloud storage
- `deleteFromAzureBlob()`: Delete from cloud storage
- `extractBlobNameFromUrl()`: Parse blob name from URL

**Configuration:**
- Uses `AZURE_STORAGE_CONNECTION_STRING` env variable
- Container: `AZURE_STORAGE_CONTAINER` (default: 'avatars')
- Falls back to local storage if not configured

## Environment Variables

### Backend
```env
# Azure Blob Storage (optional)
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER=avatars
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Activity Logging

All profile operations are logged to `log_activities` table:

- `profile.view`: User viewed their profile
- `profile.update`: User updated their profile
- `profile.avatar.update`: User updated their avatar
- `profile.avatar.delete`: User deleted their avatar
- `profile.password.change`: User changed their password
- `profile.delete`: User deleted their account

Each log includes:
- User ID
- Action
- Module: 'profile'
- Description
- IP Address
- User Agent
- Timestamp

## Security Features

1. **Authentication Required**: All endpoints require valid JWT
2. **Password Verification**: Sensitive operations require password
3. **Confirmation Text**: Account deletion requires typing confirmation
4. **Token Revocation**: Password change revokes all refresh tokens
5. **Soft Delete**: Account deletion is reversible (soft delete)
6. **Email Reverification**: Email changes require reverification
7. **File Validation**: Images validated for type, size, and dimensions
8. **Rate Limiting**: API endpoints protected by rate limiters

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `/cms/profile`
4. Test each tab and feature

## Future Enhancements

- [ ] Two-Factor Authentication implementation
- [ ] Active session management
- [ ] Goodbye email template
- [ ] Profile export functionality
- [ ] Account recovery (undelete)
- [ ] Avatar history/rollback
- [ ] Password history (prevent reuse)
- [ ] Security event notifications
- [ ] OAuth profile sync

## Troubleshooting

### Avatar Upload Issues
- **Error: "File size exceeds 2MB"** → Compress image before upload
- **Error: "Invalid image file"** → Check file format (JPG, PNG, WebP only)
- **Azure upload fails** → Check `AZURE_STORAGE_CONNECTION_STRING` is set

### Password Change Issues
- **Error: "Current password is incorrect"** → Verify password
- **Error: "Password does not meet requirements"** → Follow strength rules

### Email Not Changing
- **Email already in use** → Email must be unique
- **Verification email not received** → Check email configuration

## Support

For issues or questions:
1. Check logs: `backend/logs/` and browser console
2. Review API documentation: `API_DOCUMENTATION.md`
3. Check authentication guide: `AUTHENTICATION_GUIDE.md`
