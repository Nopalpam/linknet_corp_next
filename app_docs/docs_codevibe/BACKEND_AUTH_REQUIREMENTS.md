# 🔐 BACKEND REQUIREMENTS - Auth Security

## ⚠️ CRITICAL: Backend Must Comply

Untuk sistem auth security bekerja dengan benar, backend **HARUS** mengikuti requirement berikut.

---

## 1️⃣ HTTP STATUS CODES

### ✅ **BENAR:**

**Token Expired/Invalid:**
```typescript
res.status(401).json({
  success: false,
  message: "Access token has expired",
  code: "TOKEN_EXPIRED"
});
```

**Unauthorized (No Token):**
```typescript
res.status(401).json({
  success: false,
  message: "No token provided",
  code: "UNAUTHORIZED"
});
```

**Forbidden (Valid Token, No Permission):**
```typescript
res.status(403).json({
  success: false,
  message: "You don't have permission to access this resource",
  code: "FORBIDDEN"
});
```

### ❌ **SALAH:**

```typescript
// JANGAN INI!
res.status(200).json({
  success: false,
  message: "Token expired"
});
```

**Why?** Status 200 = Success. Frontend tidak bisa detect auth error.

---

## 2️⃣ REQUIRED RESPONSE FORMAT

### **Endpoint: `GET /api/v1/auth/me`**

**Success Response (Token Valid):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ACTIVE",
    "roles": [
      {
        "id": "role-uuid",
        "name": "Admin",
        "slug": "admin"
      }
    ],
    "permissions": [
      "users.read",
      "users.write",
      "pages.read"
    ]
  }
}
```

**Error Response (Token Expired):**
```json
{
  "success": false,
  "message": "Access token has expired",
  "code": "TOKEN_EXPIRED"
}
```

**Error Response (Token Invalid):**
```json
{
  "success": false,
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}
```

**Error Response (No Token):**
```json
{
  "success": false,
  "message": "No token provided",
  "code": "UNAUTHORIZED"
}
```

---

## 3️⃣ TOKEN VALIDATION LOGIC

### **Recommended Flow:**

```typescript
// Middleware or Route Handler
async function validateToken(req, res, next) {
  // 1. Extract token from header
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      code: "UNAUTHORIZED"
    });
  }
  
  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if token is expired (jwt.verify already does this)
    // 4. Check if token exists in database (optional, for logout tracking)
    const tokenExists = await checkTokenInDatabase(token);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
        code: "TOKEN_REVOKED"
      });
    }
    
    // 5. Attach user to request
    req.user = await getUserById(decoded.userId);
    
    next();
  } catch (error) {
    // Handle JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Access token has expired",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN"
      });
    }
    
    // Other errors
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}
```

---

## 4️⃣ ERROR CODES STANDARD

Gunakan error codes yang konsisten:

| Code | Status | Meaning |
|------|--------|---------|
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `INVALID_TOKEN` | 401 | Token format invalid or tampered |
| `TOKEN_REVOKED` | 401 | Token has been manually revoked |
| `UNAUTHORIZED` | 401 | No token provided |
| `FORBIDDEN` | 403 | Valid token but no permission |
| `VALIDATION_ERROR` | 422 | Input validation failed |

---

## 5️⃣ REFRESH TOKEN ENDPOINT

### **Endpoint: `POST /api/v1/auth/refresh`**

**Request:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token-string"
  }
}
```

**Error Response (Refresh Token Expired):**
```json
{
  "success": false,
  "message": "Refresh token has expired",
  "code": "REFRESH_TOKEN_EXPIRED"
}
```

---

## 6️⃣ LOGOUT ENDPOINT

### **Endpoint: `POST /api/v1/auth/logout`**

**Purpose:** Invalidate current refresh token.

**Request:**
```json
{
  "refreshToken": "refresh-token-string"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation:**
```typescript
async function logout(req, res) {
  const { refreshToken } = req.body;
  
  // Remove refresh token from database
  await deleteRefreshToken(refreshToken);
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}
```

---

## 7️⃣ TOKEN EXPIRY TIMES

**Recommended:**
- **Access Token:** 15 minutes - 1 hour
- **Refresh Token:** 7 days - 30 days

**Example (JWT):**
```typescript
const accessToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const refreshToken = jwt.sign(
  { userId: user.id, type: 'refresh' },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

---

## 8️⃣ CORS CONFIGURATION

Pastikan CORS mengizinkan credentials:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // CRITICAL for cookies
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 9️⃣ SECURITY HEADERS

Tambahkan security headers:

```typescript
// Express.js example
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 🔟 DATABASE SCHEMA (Optional)

**Token Tracking Table:**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Index for performance
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

---

## 🧪 BACKEND TESTING CHECKLIST

### **Test 1: Valid Token**
```bash
curl -H "Authorization: Bearer VALID_TOKEN" \
  http://localhost:5000/api/v1/auth/me
```
**Expected:** Status 200, user data

### **Test 2: Expired Token**
```bash
curl -H "Authorization: Bearer EXPIRED_TOKEN" \
  http://localhost:5000/api/v1/auth/me
```
**Expected:** Status 401, code "TOKEN_EXPIRED"

### **Test 3: Invalid Token**
```bash
curl -H "Authorization: Bearer INVALID_TOKEN" \
  http://localhost:5000/api/v1/auth/me
```
**Expected:** Status 401, code "INVALID_TOKEN"

### **Test 4: No Token**
```bash
curl http://localhost:5000/api/v1/auth/me
```
**Expected:** Status 401, code "UNAUTHORIZED"

### **Test 5: Refresh Token**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}' \
  http://localhost:5000/api/v1/auth/refresh
```
**Expected:** Status 200, new access token

---

## 📝 IMPLEMENTATION EXAMPLE (Express.js)

```typescript
// routes/auth.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  // ... login logic
  
  res.status(200).json({
    success: true,
    data: {
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken
    }
  });
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Refresh token expired",
      code: "REFRESH_TOKEN_EXPIRED"
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  await deleteRefreshToken(refreshToken);
  
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;
```

---

## ⚠️ COMMON MISTAKES TO AVOID

1. ❌ Returning status 200 for auth errors
2. ❌ Not including error codes
3. ❌ Inconsistent error format
4. ❌ Not checking token expiry
5. ❌ Not validating refresh tokens
6. ❌ Not cleaning up expired tokens
7. ❌ Not setting CORS credentials

---

## ✅ VALIDATION CHECKLIST

- [ ] `/auth/me` returns 401 for expired token
- [ ] Response includes `code: "TOKEN_EXPIRED"`
- [ ] Response format matches frontend expectations
- [ ] CORS allows credentials
- [ ] Token validation checks expiry
- [ ] Refresh token endpoint works
- [ ] Logout endpoint invalidates tokens
- [ ] Error messages are user-friendly

---

## 📚 RELATED DOCUMENTATION

- Frontend: `AUTH_SECURITY_IMPLEMENTATION.md`
- Testing: `AUTH_SECURITY_TESTING.md`
- Quick Ref: `AUTH_SECURITY_QUICK_REF.md`

---

**Backend Compliance:** MANDATORY  
**Security Impact:** CRITICAL 🔴  
**Last Updated:** January 25, 2026
