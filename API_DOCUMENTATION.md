# API Endpoints Documentation

## Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.linknetcorp.com/api/v1
```

## Health Check

### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "environment": "development"
}
```

## API Info

### Get API Information
```http
GET /api/v1
```

**Response:**
```json
{
  "message": "LinkNet Corp API",
  "version": "1.0.0",
  "status": "active",
  "endpoints": {
    "health": "/health",
    "api": "/api/v1"
  }
}
```

## Authentication (Example)

### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Users (Example)

### Get All Users
```http
GET /api/v1/users
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Field to sort by
- `sortOrder` (optional): asc or desc

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User found",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "user",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### Delete User
```http
DELETE /api/v1/users/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Invalid email format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden",
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "An unexpected error occurred"
}
```

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 requests per window
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (starts at 1)
- `limit`: Number of items per page
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

**Example:**
```http
GET /api/v1/users?page=2&limit=20&sortBy=createdAt&sortOrder=desc
```

## Testing with cURL

### Health Check
```bash
curl http://localhost:5000/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Users (with token)
```bash
curl http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Testing with Postman

1. Import the API collection
2. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `token`: Your JWT token
3. Use `{{baseUrl}}` and `{{token}}` in requests

---

**Note:** This is example documentation. Actual endpoints need to be implemented in the backend.
