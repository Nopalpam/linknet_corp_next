# 🔐 AUTH STATE QUICK REFERENCE

## 🚀 QUICK START

### **Gunakan Auth di Component:**
```typescript
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, isLoading, isAuthenticated, logout, refreshUser } = useAuth();
  
  // ✅ Always use safe fallback
  const displayName = user?.name || "User";
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;
  
  return <div>Hello, {displayName}!</div>;
}
```

---

## 🎯 COMMON USE CASES

### **1. Display User Info (Safe)**
```typescript
const { user } = useAuth();

// ❌ WRONG (can cause undefined)
<span>{user.name}</span>

// ✅ CORRECT (safe fallback)
<span>{user?.name || "User"}</span>
<span>{user?.email || "user@example.com"}</span>
<img src={user?.avatar || "/images/default-avatar.jpg"} />
```

---

### **2. Manual Refresh User**
```typescript
const { refreshUser } = useAuth();

async function handleProfileUpdate() {
  await updateProfile(data);
  await refreshUser(); // ✅ Refresh user after update
  toast.success("Profile updated!");
}
```

---

### **3. Check Permissions**
```typescript
const { user } = useAuth();

const canEdit = user?.permissions?.includes("posts.edit") ?? false;
const isAdmin = user?.roles?.some(r => r.slug === "admin") ?? false;

{canEdit && <button>Edit</button>}
{isAdmin && <AdminPanel />}
```

---

### **4. Protected Component**
```typescript
function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  
  return <div>Protected content</div>;
}
```

---

### **5. Conditional Rendering**
```typescript
const { user, isAuthenticated } = useAuth();

return (
  <>
    {isAuthenticated ? (
      <div>
        <h1>Welcome back, {user?.name}!</h1>
        <Dashboard />
      </div>
    ) : (
      <div>
        <h1>Welcome!</h1>
        <LoginForm />
      </div>
    )}
  </>
);
```

---

## 🔧 TROUBLESHOOTING

### **Problem: User is undefined after navigation**
```typescript
// ✅ SOLUTION: Already fixed! But if you still see this:

// 1. Check if token exists
console.log("Token:", localStorage.getItem("auth_token"));

// 2. Check if AuthProvider wraps your app
// File: app/layout.tsx
<AuthProvider>
  {children}
</AuthProvider>

// 3. Force refresh user
const { refreshUser } = useAuth();
await refreshUser();
```

---

### **Problem: Loading state never ends**
```typescript
// ✅ Check console for errors
// Usually means:
// 1. Backend is down
// 2. Token is invalid
// 3. Network error

// Force logout and re-login:
const { logout } = useAuth();
logout();
```

---

### **Problem: User data is stale**
```typescript
// ✅ SOLUTION: Call refreshUser()
const { refreshUser } = useAuth();

useEffect(() => {
  refreshUser(); // Refresh on component mount
}, [refreshUser]);
```

---

## 📚 API REFERENCE

### **useAuth() Hook**

```typescript
type AuthContextType = {
  // User object (null if not logged in)
  user: User | null;
  
  // Loading state (true during initial auth check)
  isLoading: boolean;
  
  // Shortcut for !!user
  isAuthenticated: boolean;
  
  // Login function
  login: (email: string, password: string) => Promise<void>;
  
  // Logout function
  logout: () => Promise<void>;
  
  // Refresh user profile from backend
  refreshUser: () => Promise<void>;
};
```

---

### **User Object**

```typescript
type User = {
  id: string;              // "uuid-123"
  email: string;           // "user@example.com"
  name: string;            // "John Doe" (firstName + lastName)
  firstName: string;       // "John"
  lastName: string;        // "Doe"
  avatar: string | null;   // "https://..." or null
  status: string;          // "ACTIVE" | "INACTIVE"
  roles: Role[];           // [{id, name, slug}]
  permissions: string[];   // ["posts.edit", "users.view"]
};
```

---

## ⚡ PERFORMANCE TIPS

### **1. Avoid Unnecessary Refreshes**
```typescript
// ❌ BAD: Refresh on every render
function MyComponent() {
  const { refreshUser } = useAuth();
  refreshUser(); // Don't do this!
}

// ✅ GOOD: Refresh only when needed
function MyComponent() {
  const { refreshUser } = useAuth();
  
  useEffect(() => {
    // Only on mount
    refreshUser();
  }, [refreshUser]);
}
```

---

### **2. Use Memoization**
```typescript
const { user } = useAuth();

// ✅ Memoize computed values
const canEdit = useMemo(() => 
  user?.permissions?.includes("posts.edit") ?? false,
  [user]
);

const isAdmin = useMemo(() =>
  user?.roles?.some(r => r.slug === "admin") ?? false,
  [user]
);
```

---

### **3. Debounce Profile Checks**
```typescript
// Already built-in! 
// AuthContext automatically debounces refreshUser()
// Max 1 refresh per 30 seconds on navigation

// Manual debounce:
const { refreshUser } = useAuth();
const debouncedRefresh = useMemo(
  () => debounce(refreshUser, 1000),
  [refreshUser]
);
```

---

## 🎨 UI PATTERNS

### **1. Loading Skeleton**
```typescript
function UserProfile() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
      </div>
    );
  }
  
  return (
    <div>
      <img src={user?.avatar || "/default.jpg"} />
      <span>{user?.name}</span>
    </div>
  );
}
```

---

### **2. Conditional Menu Items**
```typescript
function Sidebar() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.roles?.some(r => r.slug === "admin");
  
  return (
    <nav>
      <MenuItem href="/">Home</MenuItem>
      {isAuthenticated && <MenuItem href="/profile">Profile</MenuItem>}
      {isAdmin && <MenuItem href="/admin">Admin Panel</MenuItem>}
    </nav>
  );
}
```

---

### **3. Avatar with Fallback**
```typescript
function UserAvatar({ size = 40 }) {
  const { user } = useAuth();
  const avatarUrl = user?.avatar || "/images/default-avatar.jpg";
  const displayName = user?.name || "User";
  
  return (
    <Image
      src={avatarUrl}
      alt={displayName}
      width={size}
      height={size}
      onError={(e) => {
        // Fallback if image fails to load
        e.currentTarget.src = "/images/default-avatar.jpg";
      }}
    />
  );
}
```

---

## 🔒 SECURITY BEST PRACTICES

### **1. Never Expose Sensitive Data**
```typescript
// ❌ BAD: Expose refresh token
console.log(localStorage.getItem("refresh_token"));

// ✅ GOOD: Only log what's needed (in dev only)
if (process.env.NODE_ENV === "development") {
  console.log("User ID:", user?.id);
}
```

---

### **2. Validate Permissions**
```typescript
// ❌ BAD: Trust frontend check only
{user?.roles?.includes("admin") && <DeleteButton />}

// ✅ GOOD: Backend must also validate
async function deleteUser(id: string) {
  // Backend will check permissions again
  await api.delete(`/users/${id}`);
}
```

---

### **3. Handle Expired Sessions**
```typescript
// ✅ Already handled by BaseService!
// If token expires → auto-refresh
// If refresh fails → auto-logout
// If 401/403 → redirect to /login
```

---

## 🧪 TESTING HELPERS

### **Mock Auth Provider (for tests)**
```typescript
import { AuthContext } from "@/context/AuthContext";

function MockAuthProvider({ user, children }) {
  const value = {
    user,
    isLoading: false,
    isAuthenticated: !!user,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Usage in test:
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  // ...
};

render(
  <MockAuthProvider user={mockUser}>
    <MyComponent />
  </MockAuthProvider>
);
```

---

## 📖 RELATED DOCS

- [AUTH_STATE_FIX_COMPLETE.md](./AUTH_STATE_FIX_COMPLETE.md) - Full technical explanation
- [QUICKSTART_AUTH.md](./QUICKSTART_AUTH.md) - Auth integration guide
- [AUTH_FLOW_DIAGRAM.md](./AUTH_FLOW_DIAGRAM.md) - Auth flow diagram

---

**Last Updated:** January 24, 2026  
**Status:** Production Ready ✅
