# Development Guide

## 🏗️ Project Architecture

### Backend Architecture
```
Backend (Express.js + TypeScript)
│
├── Server Layer (server.ts)
│   ├── Middleware (helmet, cors, compression)
│   └── Error Handling
│
├── Route Layer (routes/)
│   └── API endpoint definitions
│
├── Controller Layer (controllers/)
│   └── HTTP request/response handling
│
├── Service Layer (services/)
│   └── Business logic
│
├── Model Layer (models/)
│   └── Data structures & validation
│
└── Utils & Config
    ├── Configuration (config/)
    └── Utilities (utils/)
```

### Frontend Architecture
```
Frontend (Next.js 14 + TypeScript)
│
├── App Router (app/)
│   ├── Pages & Routes
│   └── Layouts
│
├── Components (components/)
│   ├── UI Components
│   └── Feature Components
│
├── State Management
│   └── Zustand stores (optional)
│
├── Data Fetching
│   ├── API Client (lib/api-client.ts)
│   └── SWR hooks
│
└── Types & Utils
    ├── TypeScript types
    └── Helper functions
```

## 🔧 Best Practices

### 1. Code Organization

#### Backend Controllers
```typescript
// ✅ Good - Thin controller, uses service layer
export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return ResponseHandler.success(res, 'Users retrieved', users);
    } catch (error) {
      next(error);
    }
  }
}

// ❌ Bad - Fat controller with business logic
export class UserController {
  async getAll(req: Request, res: Response) {
    const users = await db.query('SELECT * FROM users');
    const filtered = users.filter(u => u.active);
    res.json({ success: true, data: filtered });
  }
}
```

#### Frontend Components
```tsx
// ✅ Good - Single responsibility
export function UserCard({ user }: { user: User }) {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// ❌ Bad - Too many responsibilities
export function UserDashboard() {
  // Fetching, rendering, form handling all in one
}
```

### 2. Error Handling

#### Backend
```typescript
// ✅ Always use try-catch with next()
async getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return ResponseHandler.notFound(res, 'User not found');
    }
    return ResponseHandler.success(res, 'User found', user);
  } catch (error) {
    next(error);
  }
}
```

#### Frontend
```typescript
// ✅ Handle errors gracefully
const { data, error, isLoading } = useSWR('/api/users', fetcher);

if (error) return <ErrorMessage error={error} />;
if (isLoading) return <Spinner />;
```

### 3. TypeScript Usage

```typescript
// ✅ Define interfaces for data structures
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Type function parameters and returns
async function getUser(id: string): Promise<User | null> {
  // implementation
}

// ❌ Avoid 'any' type
const data: any = await fetch(); // Bad
```

### 4. Environment Variables

```typescript
// ✅ Use environment variables for configuration
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ Provide defaults
const port = process.env.PORT || 5000;

// ❌ Don't hardcode sensitive values
const apiKey = 'sk-1234567890'; // Bad
```

## 🧪 Testing

### Backend Unit Test Example
```typescript
// src/services/__tests__/user.service.test.ts
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should get all users', async () => {
    const users = await userService.getAllUsers();
    expect(users).toBeInstanceOf(Array);
  });
});
```

### Frontend Component Test Example
```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 🔐 Security Best Practices

### 1. Input Validation
```typescript
// Backend - Always validate input
import { body, validationResult } from 'express-validator';

router.post('/users',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### 2. Authentication
```typescript
// Use JWT tokens
import jwt from 'jsonwebtoken';

const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
  expiresIn: '7d'
});
```

### 3. Rate Limiting
```typescript
// Already configured in server.ts
// Adjust limits in .env file
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Performance Optimization

### Backend
- ✅ Use compression middleware (already configured)
- ✅ Implement caching (Redis recommended)
- ✅ Use database indexes
- ✅ Implement pagination for large datasets

### Frontend
- ✅ Use Next.js Image component for images
- ✅ Implement code splitting
- ✅ Use SWR for data caching
- ✅ Lazy load components

## 🚀 Deployment

### Backend Deployment Checklist
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to production URL
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up database connection pooling
- [ ] Configure logging
- [ ] Set up monitoring

### Frontend Deployment Checklist
- [ ] Update NEXT_PUBLIC_API_URL
- [ ] Optimize images
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Test build: `npm run build`

## 📁 Folder Structure Guidelines

### When to create new files

#### Backend
- **Controllers**: One file per resource (users.controller.ts, posts.controller.ts)
- **Services**: Business logic that matches controllers
- **Routes**: One file per resource or feature
- **Middleware**: Reusable middleware functions
- **Models**: Data structures and schemas

#### Frontend
- **Pages**: One file per route in app/ directory
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for shared logic
- **Lib**: Utility functions and helpers

## 🔍 Debugging Tips

### Backend Debugging
```bash
# Enable debug mode
NODE_ENV=development npm run dev

# Check logs in terminal
# Add console.log for debugging (remove before commit)
```

### Frontend Debugging
```typescript
// Use React DevTools
// Add console.log in development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## 📚 Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
