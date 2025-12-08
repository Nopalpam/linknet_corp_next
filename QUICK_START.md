# Quick Start Guide

## 📋 Prerequisites Check
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env file (use your preferred editor)
notepad .env  # Windows
# or
code .env     # VS Code
```

**Minimal configuration needed:**
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-here-change-this
CORS_ORIGIN=http://localhost:3000
```

### Step 3: Start Backend Server
```bash
npm run dev
```
✅ Backend should now be running on `http://localhost:5000`

### Step 4: Install Frontend Dependencies (in new terminal)
```bash
cd frontend
npm install
```

### Step 5: Configure Frontend Environment
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local
notepad .env.local  # Windows
# or
code .env.local     # VS Code
```

**Minimal configuration:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=LinkNet Corp
```

### Step 6: Start Frontend Server
```bash
npm run dev
```
✅ Frontend should now be running on `http://localhost:3000`

## ✅ Verify Installation

1. **Backend Health Check**
   - Open browser: `http://localhost:5000/health`
   - Should see: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Frontend**
   - Open browser: `http://localhost:3000`
   - Should see the welcome page

## 📝 Next Steps

### 1. Create Your First API Endpoint

**Backend:** Create `backend/src/routes/users.routes.ts`
```typescript
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all users' });
});

export default router;
```

**Add to** `backend/src/server.ts`:
```typescript
import userRoutes from './routes/users.routes';
app.use(`${API_PREFIX}/users`, userRoutes);
```

### 2. Create Your First Page

**Frontend:** Create `frontend/app/users/page.tsx`
```tsx
export default function UsersPage() {
  return (
    <div className="container py-5">
      <h1>Users Page</h1>
    </div>
  );
}
```

Visit: `http://localhost:3000/users`

## 🛠️ Development Tips

### Backend Hot Reload
- Code changes automatically restart the server (via nodemon)
- Watch the terminal for compilation errors

### Frontend Hot Reload
- Changes appear instantly in browser
- No manual refresh needed

### Code Quality
```bash
# Format code
npm run format

# Check for errors
npm run lint
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.3/)

---

**Need help?** Open an issue or check the main README.md
