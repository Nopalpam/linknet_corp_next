# 🚀 Profile Page - Quick Start Guide

## Overview
Halaman Profile yang telah direvisi dengan fitur:
- ✅ Data sesuai database `users`
- ✅ Upload avatar
- ✅ Edit profile via modal
- ✅ Real-time update tanpa refresh

---

## 📦 New Files Created

```
frontend/src/components/user-profile/
├── ProfileHeader.tsx          ← Avatar & user header
├── AvatarUpload.tsx          ← Avatar upload component
├── ProfileInfoCard.tsx       ← Profile information display
└── EditProfileModal.tsx      ← Edit profile modal
```

---

## 🎯 Quick Test

### 1. Start Development Server
```bash
cd frontend
npm run dev
```

### 2. Access Profile Page
```
http://localhost:3000/profile
```

### 3. Test Features

#### Upload Avatar
1. Click pada avatar di bagian atas
2. Select image file (JPG/PNG/WebP)
3. Avatar akan langsung ter-update

#### Edit Profile
1. Click tombol "Edit" di ProfileInfoCard
2. Ubah data (first name, last name, username, phone)
3. Click "Save Changes"
4. Modal akan close otomatis setelah sukses

---

## 🔑 Key Features

### ProfileHeader Component
```tsx
import ProfileHeader from "@/components/user-profile/ProfileHeader";

<ProfileHeader 
  profile={profile} 
  onAvatarUpdated={(newAvatar) => handleAvatarUpdate(newAvatar)} 
/>
```

### ProfileInfoCard Component
```tsx
import ProfileInfoCard from "@/components/user-profile/ProfileInfoCard";

<ProfileInfoCard 
  profile={profile} 
  onEditClick={() => openModal()} 
/>
```

### EditProfileModal Component
```tsx
import EditProfileModal from "@/components/user-profile/EditProfileModal";

<EditProfileModal
  isOpen={isOpen}
  onClose={closeModal}
  profile={profile}
  onProfileUpdated={(updated) => setProfile(updated)}
/>
```

---

## 📊 Data Structure

### UserProfile Interface
```typescript
{
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  permissions: string[];
}
```

---

## 🔧 API Usage

### Get Profile
```typescript
import { profileService } from "@/services/profile.service";

const response = await profileService.getProfile();
console.log(response.data);
```

### Update Profile
```typescript
const data = {
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  phone: "+628123456789"
};

const response = await profileService.updateProfile(data);
console.log(response.message); // "Profile updated successfully"
```

### Upload Avatar
```typescript
const file = event.target.files[0];
const response = await profileService.updateAvatar(file);
console.log(response.data.avatar); // New avatar URL
```

---

## 🎨 Styling

All components use **Tailwind CSS** with:
- ✅ Responsive design (mobile-first)
- ✅ Dark mode support
- ✅ Consistent spacing & colors
- ✅ Animation & transitions

---

## ⚠️ Important Notes

### 1. Backend Must Be Running
```bash
cd backend
npm run dev
```

### 2. Authentication Required
User must be logged in to access profile page.

### 3. Avatar Upload Limits
- Max file size: **5MB**
- Allowed formats: **JPG, PNG, WebP**

### 4. Username Rules
- Min length: **3 characters**
- Max length: **30 characters**
- Allowed: **letters, numbers, hyphens, underscores**

---

## 🐛 Common Issues

### Issue: Profile tidak muncul
**Solution:** Check if user is authenticated
```typescript
const { user, isAuthenticated } = useAuth();
console.log({ user, isAuthenticated });
```

### Issue: Avatar upload gagal
**Solution:** Check file size dan type
```typescript
// Max 5MB
if (file.size > 5 * 1024 * 1024) {
  alert("File too large");
}

// Check type
if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
  alert("Invalid file type");
}
```

### Issue: Modal tidak tertutup
**Solution:** Check modal state
```typescript
const { isOpen, closeModal } = useModal();
console.log('Modal state:', isOpen);
```

---

## 📱 Responsive Breakpoints

```css
sm:  640px   /* Small devices */
md:  768px   /* Medium devices */
lg:  1024px  /* Large devices */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X Extra large devices */
```

---

## 🔐 Security Notes

- All API calls require **Bearer token**
- CSRF protection enabled
- File uploads validated on **client & server**
- Input sanitization on backend
- Rate limiting on API endpoints

---

## 📈 Performance Tips

1. **Avatar optimization**: Images auto-resized on backend
2. **Lazy loading**: Avatar loaded only when visible
3. **Caching**: Profile data cached in auth context
4. **Debouncing**: Form validation debounced

---

## 🎓 Learn More

- [Full Documentation](./PROFILE_IMPLEMENTATION_COMPLETE.md)
- [Auth Guide](./AUTH_INTEGRATION_COMPLETE.md)
- [API Reference](./backend/README.md)

---

**Need Help?** Check the full documentation or contact the development team.

✅ **Profile Implementation Complete**
