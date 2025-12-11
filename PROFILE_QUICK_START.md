# Profile Management Quick Start Guide

## 🚀 Quick Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables** (Optional - for Azure Blob Storage)
   ```env
   # .env file
   AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
   AZURE_STORAGE_CONTAINER=avatars
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   ```env
   # .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   ```

3. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## 📝 Usage Guide

### Accessing Profile Page

Navigate to: `http://localhost:3000/cms/profile`

### General Tab - Update Profile

1. **Update Avatar**
   - Drag & drop an image OR click the avatar area
   - Adjust crop position and zoom
   - Click "Upload" to save

2. **Update Information**
   - Modify First Name, Last Name, Email, or Phone
   - Click "Save Changes"
   - If email changes, you'll need to verify the new email

### Security Tab - Change Password

1. Enter current password
2. Enter new password (must meet requirements)
3. Confirm new password
4. Click "Change Password"
5. You'll be logged out from all other devices

### Danger Zone - Delete Account

1. Click "Delete Account" button
2. Enter your password
3. Type "DELETE MY ACCOUNT" exactly
4. Click "Delete My Account"
5. Your account will be soft-deleted and you'll be logged out

## 🧪 Testing the API

### Using cURL

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Profile:**
```bash
curl -X PUT http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

**Upload Avatar:**
```bash
curl -X PUT http://localhost:5000/api/v1/profile/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Change Password:**
```bash
curl -X PUT http://localhost:5000/api/v1/profile/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
```

**Delete Account:**
```bash
curl -X DELETE http://localhost:5000/api/v1/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "YourPass123!",
    "confirmation": "DELETE MY ACCOUNT"
  }'
```

## 📋 Common Tasks

### Add Profile Link to Navigation

```tsx
// In your navigation component
<Link href="/cms/profile">
  <i className="bi bi-person-circle"></i>
  My Profile
</Link>
```

### Display Current User Avatar

```tsx
import { useProfile } from '@/hooks/useProfile';
import Image from 'next/image';

function UserAvatar() {
  const { profile } = useProfile();
  
  return (
    <div className="user-avatar">
      {profile?.avatar ? (
        <Image 
          src={profile.avatar} 
          alt={profile.fullName}
          width={40}
          height={40}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      ) : (
        <i className="bi bi-person-circle" style={{ fontSize: '2rem' }}></i>
      )}
    </div>
  );
}
```

### Check User Permissions

```tsx
import { useProfile } from '@/hooks/useProfile';

function ProtectedContent() {
  const { profile } = useProfile();
  
  const canEdit = profile?.permissions.includes('content.edit');
  
  if (!canEdit) {
    return <div>You don't have permission to edit content.</div>;
  }
  
  return <div>Edit form here...</div>;
}
```

## 🔧 Troubleshooting

### Avatar Upload Not Working

**Issue:** Avatar upload fails or doesn't show
- **Check:** File size (must be < 2MB)
- **Check:** File format (JPG, PNG, or WebP only)
- **Check:** Azure Storage configuration (if using cloud storage)

### Email Not Updating

**Issue:** Email update fails
- **Check:** Email format is valid
- **Check:** Email is not already in use by another user

### Password Change Fails

**Issue:** Password validation errors
- **Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)

### Session Issues After Password Change

**Behavior:** This is expected - changing password logs you out from all other devices
- **Solution:** Log in again on other devices

## 🎯 Best Practices

1. **Avatar Images**
   - Use square images for best results
   - Recommended size: at least 400x400px
   - Keep file size under 1MB for faster uploads

2. **Email Changes**
   - Users must verify new email address
   - Old email remains active until verification

3. **Password Security**
   - Enforce strong password requirements
   - Users should use unique passwords
   - Password change forces logout on all devices

4. **Account Deletion**
   - Soft delete allows data recovery if needed
   - Consider implementing a grace period
   - Send confirmation email before final deletion

## 📚 Related Documentation

- [Profile Management README](./PROFILE_MANAGEMENT_README.md) - Complete documentation
- [API Documentation](./backend/API_DOCUMENTATION.md) - Full API reference
- [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Auth setup and usage

## 🆘 Support

Having issues? Check:
1. Backend logs: `backend/logs/`
2. Browser console for frontend errors
3. Network tab in browser DevTools
4. Database connection and migrations
