# RBAC Integration Checklist

Use this checklist to integrate the RBAC system into your existing application.

## ✅ Installation (Completed)

- [x] Database schema created
- [x] Permissions defined (~100 permissions)
- [x] Roles created (Super Admin, Admin, Editor, User)
- [x] Backend utilities implemented
- [x] Frontend hooks & components created
- [x] Documentation completed

## 🔧 Backend Integration

### 1. Route Protection

- [ ] **User Management Routes** (`/api/users`)
  - [ ] Add `requirePermission(Permission.USERS_MANAGEMENT_READ)` to GET
  - [ ] Add `requirePermission(Permission.USERS_MANAGEMENT_CREATE)` to POST
  - [ ] Add `requirePermission(Permission.USERS_MANAGEMENT_UPDATE)` to PUT
  - [ ] Add `requirePermission(Permission.USERS_MANAGEMENT_DELETE)` to DELETE

- [ ] **Role Management Routes** (`/api/roles`)
  - [ ] Add `requirePermission(Permission.ROLE_MANAGEMENT_READ)` to GET
  - [ ] Add `requirePermission(Permission.ROLE_MANAGEMENT_CREATE)` to POST
  - [ ] Add `requirePermission(Permission.ROLE_MANAGEMENT_UPDATE)` to PUT
  - [ ] Add `requirePermission(Permission.ROLE_MANAGEMENT_DELETE)` to DELETE

- [ ] **Content Routes** (News, Pages, Announcements, etc.)
  - [ ] Add appropriate `requirePermission()` middleware to each route
  - [ ] Use `requireAllPermissions()` where multiple permissions needed

- [ ] **Settings Routes** (`/api/settings`)
  - [ ] Add `requirePermission(Permission.SETTINGS_READ)` to GET
  - [ ] Add `requirePermission(Permission.SETTINGS_UPDATE)` to PUT/PATCH

### 2. Import Statements

Add these imports to all route files:

```typescript
import { requirePermission, requireAllPermissions } from '@/middlewares/rbac.middleware';
import { Permission } from '@/constants/permissions';
```

### 3. Main App Integration

- [ ] **Register role routes** in `server.ts` or `app.ts`:
  ```typescript
  import roleRoutes from './routes/role.routes';
  app.use('/api/roles', roleRoutes);
  app.use('/api/permissions', roleRoutes); // permissions endpoint
  ```

- [ ] **Initialize Redis** in `server.ts`:
  ```typescript
  import { redisClient, isRedisAvailable } from './config/redis';
  
  // On startup
  const redisStatus = await isRedisAvailable();
  console.log(`Redis status: ${redisStatus ? 'Connected' : 'Unavailable'}`);
  ```

### 4. Error Handling

- [ ] Verify 403 errors return proper messages
- [ ] Test with different user roles
- [ ] Check error responses include permission details

## 🎨 Frontend Integration

### 1. Navigation/Sidebar

- [ ] **Wrap menu items** with `<CanAccess>`:
  ```tsx
  <CanAccess permission={Permission.USERS_MANAGEMENT_READ}>
    <Link href="/users">Users</Link>
  </CanAccess>
  ```

- [ ] **Group sections** by permission module:
  ```tsx
  {canAccessContent && (
    <div className="nav-section">
      <h3>Content Management</h3>
      {/* Content menu items */}
    </div>
  )}
  ```

### 2. Page Protection

- [ ] **User Management Pages** (`/users/*`)
  - [ ] List page: Check `Permission.USERS_MANAGEMENT_READ`
  - [ ] Create page: Check `Permission.USERS_MANAGEMENT_CREATE`
  - [ ] Edit page: Check `Permission.USERS_MANAGEMENT_UPDATE`
  - [ ] Delete action: Check `Permission.USERS_MANAGEMENT_DELETE`

- [ ] **Content Pages** (News, Pages, Announcements)
  - [ ] Add permission checks to each page
  - [ ] Guard create/edit/delete buttons
  - [ ] Show appropriate messages for denied access

- [ ] **Settings Pages**
  - [ ] Check `Permission.SETTINGS_READ` on load
  - [ ] Check `Permission.SETTINGS_UPDATE` for forms

### 3. Component Updates

- [ ] **Action Buttons**
  ```tsx
  <CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
    <button>Create User</button>
  </CanAccess>
  
  <CanAccess permission={Permission.USERS_MANAGEMENT_DELETE}>
    <button>Delete</button>
  </CanAccess>
  ```

- [ ] **Table Actions**
  ```tsx
  {users.map(user => (
    <tr>
      <td>{user.name}</td>
      <td>
        <CanAccess permission={Permission.USERS_MANAGEMENT_UPDATE}>
          <EditButton />
        </CanAccess>
        <CanAccess permission={Permission.USERS_MANAGEMENT_DELETE}>
          <DeleteButton />
        </CanAccess>
      </td>
    </tr>
  ))}
  ```

- [ ] **Forms**
  - [ ] Hide submit buttons if no permission
  - [ ] Disable fields based on permissions
  - [ ] Show read-only view if no update permission

### 4. Hooks Integration

- [ ] **Replace manual checks** with hooks:
  ```tsx
  // Before
  const isAdmin = user?.role === 'admin';
  
  // After
  const isAdmin = useRole(Role.ADMIN);
  const canCreate = usePermission(Permission.USERS_MANAGEMENT_CREATE);
  ```

- [ ] **Use in conditional rendering**:
  ```tsx
  const canDelete = usePermission(Permission.USERS_MANAGEMENT_DELETE);
  
  return (
    <div>
      {canDelete && <DeleteButton />}
    </div>
  );
  ```

## 🧪 Testing

### Backend Tests

- [ ] **Test each role**:
  - [ ] Login as Super Admin → Access all endpoints
  - [ ] Login as Admin → Cannot access user/role management
  - [ ] Login as Editor → Cannot delete content
  - [ ] Login as User → Read-only access

- [ ] **Test permissions**:
  - [ ] Create role without required permission → 403 error
  - [ ] Access protected route without token → 401 error
  - [ ] Delete system role → 403 error

- [ ] **Test caching**:
  - [ ] Update role permissions → Cache invalidates
  - [ ] User permissions update immediately
  - [ ] Redis failure → System falls back to DB

### Frontend Tests

- [ ] **UI Visibility**:
  - [ ] Buttons hide/show based on permissions
  - [ ] Menu items appear only for authorized users
  - [ ] Pages redirect if no access

- [ ] **User Experience**:
  - [ ] Appropriate error messages shown
  - [ ] No broken functionality
  - [ ] Smooth permission checks (no flicker)

## 📝 Database

### Seed Verification

- [ ] Run seed: `npx prisma db seed`
- [ ] Verify in database:
  ```sql
  SELECT COUNT(*) FROM permissions;  -- Should be ~100
  SELECT COUNT(*) FROM roles;        -- Should be 4
  SELECT * FROM users WHERE email = 'admin@example.com';
  ```

### Migrations

- [ ] Create migration: `npx prisma migrate dev --name add_rbac_system`
- [ ] Verify tables created:
  - [ ] `roles`
  - [ ] `permissions`
  - [ ] `role_permissions`
  - [ ] `user_roles`

## 🔧 Configuration

### Environment Variables

- [ ] **Add to `.env`**:
  ```env
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  REDIS_DB=0
  ```

- [ ] **Verify in production**:
  - [ ] Redis connection works
  - [ ] Fallback to DB if Redis fails
  - [ ] No hardcoded values

### Redis Setup

- [ ] **Install Redis**:
  - [ ] Docker: `docker run -d --name redis -p 6379:6379 redis:alpine`
  - [ ] Or download Windows binary
  - [ ] Or use cloud Redis (AWS ElastiCache, Azure Cache)

- [ ] **Test connection**:
  ```bash
  redis-cli ping  # Should return PONG
  ```

## 📚 Documentation

- [ ] **Update README.md** with RBAC information
- [ ] **Add team training** on permission system
- [ ] **Document custom roles** if created
- [ ] **Update API documentation** with permission requirements

## 🚀 Deployment

### Pre-Deployment

- [ ] All routes protected
- [ ] Frontend guards in place
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Redis configured

### Deployment Steps

- [ ] **Database**:
  - [ ] Run migrations in production
  - [ ] Run seed (or manually create roles/permissions)
  - [ ] Verify data

- [ ] **Application**:
  - [ ] Deploy backend with new dependencies
  - [ ] Deploy frontend with new components
  - [ ] Test in production

- [ ] **Post-Deployment**:
  - [ ] Create admin users
  - [ ] Assign appropriate roles
  - [ ] Test critical workflows
  - [ ] Monitor logs for permission errors

## 🔍 Verification

### Functionality Check

- [ ] **Login Flow**:
  - [ ] User can login
  - [ ] Token includes permissions
  - [ ] `/api/auth/me` returns roles & permissions

- [ ] **Permission Checks**:
  - [ ] Protected routes return 403 if unauthorized
  - [ ] Frontend hides unauthorized elements
  - [ ] Cache works correctly

- [ ] **Role Management**:
  - [ ] Can create custom roles
  - [ ] Can assign permissions to roles
  - [ ] Can assign roles to users
  - [ ] System roles cannot be deleted

### Performance Check

- [ ] **Response Times**:
  - [ ] Permission checks < 10ms (with Redis)
  - [ ] No significant slowdown
  - [ ] Cache hit rate > 90%

- [ ] **Redis**:
  - [ ] Monitor cache keys: `redis-cli KEYS "user:*"`
  - [ ] Monitor memory usage
  - [ ] Verify TTL set correctly

## 📞 Support Resources

- [ ] **Documentation reviewed**:
  - [ ] RBAC_GUIDE.md
  - [ ] RBAC_QUICK_START.md
  - [ ] RBAC_INTEGRATION_EXAMPLES.md

- [ ] **Team trained** on:
  - [ ] Permission constants usage
  - [ ] Middleware application
  - [ ] Frontend guards
  - [ ] Cache management

## ✨ Enhancements (Optional)

- [ ] **Add permission auditing**:
  - [ ] Log permission checks
  - [ ] Track permission denials
  - [ ] Alert on unusual patterns

- [ ] **Create role templates**:
  - [ ] Marketing role
  - [ ] Support role
  - [ ] Developer role

- [ ] **Add UI for role management**:
  - [ ] Role creation form
  - [ ] Permission assignment interface
  - [ ] User role assignment

- [ ] **Performance optimization**:
  - [ ] Increase cache duration
  - [ ] Add cache warming
  - [ ] Optimize queries

## 🎉 Completion

When all items are checked:

1. ✅ All backend routes protected
2. ✅ All frontend UI guarded
3. ✅ Tests passing
4. ✅ Documentation complete
5. ✅ Team trained
6. ✅ Production deployed

**Congratulations! Your RBAC system is fully integrated! 🚀**

---

**Need Help?**
- Check the guides in the documentation folder
- Review example code in RBAC_INTEGRATION_EXAMPLES.md
- Test with different user roles to verify behavior
