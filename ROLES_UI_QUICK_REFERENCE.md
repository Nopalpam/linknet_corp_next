# 🎯 Role Management UI/UX - Quick Reference Guide

## 📁 File Structure

```
frontend/
├── app/(admin)/cms/roles/
│   ├── page.tsx                    # ✅ UPDATED - List page dengan enhanced UI
│   ├── create/
│   │   └── page.tsx               # ✅ UPDATED - Create page dengan better layout
│   └── [id]/
│       └── edit/
│           └── page.tsx           # ✅ UPDATED - Edit page dengan improvements
│
├── components/roles/
│   ├── RoleCard.tsx               # ✅ UPDATED - Enhanced card dengan hover effects
│   ├── RoleForm.tsx               # ✅ UPDATED - Better form layout & validation
│   ├── PermissionSelector.tsx     # ✅ UPDATED - Improved accordion & checkboxes
│   └── DeleteConfirmationModal.tsx # ✅ UPDATED - Better modal design
│
└── styles/
    └── roles.module.css           # ✅ NEW - Custom animations & styling
```

---

## 🎨 Key UI Components

### 1. Enhanced Header Pattern

```tsx
<div className="d-flex align-items-center mb-2">
  <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
    <FaIcon className="text-primary" size={24} />
  </div>
  <h1 className="mb-0 fw-bold">Page Title</h1>
</div>
```

### 2. Loading State Pattern

```tsx
<div className="d-flex flex-column justify-content-center align-items-center" 
     style={{ height: '50vh' }}>
  <Spinner animation="border" style={{ width: '3rem', height: '3rem' }}>
    <span className="visually-hidden">Loading...</span>
  </Spinner>
  <p className="mt-3 text-muted fw-medium">Loading message...</p>
</div>
```

### 3. Error Handling Pattern

```tsx
const apiError = err as ApiError;
let errorMessage = 'Default message';

if (apiError?.response?.data?.error) {
  const errorData = apiError.response.data.error;
  if (typeof errorData === 'object' && 'message' in errorData) {
    errorMessage = errorData.message;
  } else if (typeof errorData === 'string') {
    errorMessage = errorData;
  }
}
```

### 4. Enhanced Alert Pattern

```tsx
<Alert variant="danger" className="shadow-sm border-0">
  <Alert.Heading className="h6 mb-2">
    <strong>Error Title</strong>
  </Alert.Heading>
  <p className="mb-0">{errorMessage}</p>
</Alert>
```

### 5. Form Field Pattern

```tsx
<Form.Group className="mb-4">
  <Form.Label className="fw-semibold">
    Field Name <span className="text-danger">*</span>
  </Form.Label>
  <Form.Control
    size="lg"
    style={{ borderRadius: '8px' }}
    // ... other props
  />
  <Form.Text className="text-muted">
    Helper text here
  </Form.Text>
</Form.Group>
```

### 6. Action Buttons Pattern

```tsx
<div className="d-flex gap-3 justify-content-end pt-3 border-top">
  <Button 
    variant="outline-secondary" 
    size="lg"
    style={{ minWidth: '120px' }}
  >
    Cancel
  </Button>
  <Button 
    variant="primary" 
    size="lg"
    className="shadow-sm"
    style={{ minWidth: '160px' }}
  >
    Save
  </Button>
</div>
```

---

## 🎯 Design Tokens

### Spacing
```css
/* Margins */
mb-2: 0.5rem (8px)
mb-3: 1rem (16px)
mb-4: 1.5rem (24px)

/* Padding */
p-2: 0.5rem (8px)
p-3: 1rem (16px)
p-4: 1.5rem (24px)

/* Gaps */
gap-2: 0.5rem (8px)
gap-3: 1rem (16px)
```

### Border Radius
```css
rounded: 0.375rem (6px)
rounded (custom): 8px (untuk form fields)
```

### Shadows
```css
shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)
hover shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15)
```

### Colors
```css
/* Primary */
--primary: #0d6efd
--primary-light: #e7f3ff
--primary-bg-10: rgba(13, 110, 253, 0.1)

/* Success */
--success: #198754

/* Danger */
--danger: #dc3545

/* Warning */
--warning: #ffc107

/* Neutral */
--light: #f8f9fa
--muted: #6c757d
--border: #dee2e6
```

### Typography
```css
/* Weights */
fw-medium: 500
fw-semibold: 600
fw-bold: 700

/* Sizes */
fs-4: 1.5rem
h1: 2.5rem
h5: 1.25rem
```

---

## ⚡ Common Patterns

### 1. Empty State
```tsx
<Card className="border-0 shadow-sm" style={{ marginTop: '3rem' }}>
  <Card.Body className="text-center py-5">
    <div className="mb-4">
      <div className="d-inline-flex p-4 bg-primary bg-opacity-10 rounded-circle mb-3">
        <FaIcon className="text-primary" size={48} />
      </div>
      <h4 className="fw-bold mb-2">Title</h4>
      <p className="text-muted mb-4">Description</p>
    </div>
    <Button variant="primary" size="lg">CTA Button</Button>
  </Card.Body>
</Card>
```

### 2. Stats Display
```tsx
<div className="text-center p-3 rounded border" 
     style={{ backgroundColor: '#f8f9fa' }}>
  <FaIcon className="text-primary mb-2" size={20} />
  <div className="fw-bold fs-4 text-primary">{count}</div>
  <small className="text-muted fw-medium">Label</small>
</div>
```

### 3. Icon Badge
```tsx
<div className="p-2 bg-primary bg-opacity-10 rounded me-3">
  <FaIcon className="text-primary" size={24} />
</div>
```

### 4. Hover Card
```tsx
<Card 
  className="h-100 border-0 shadow-sm"
  style={{ transition: 'all 0.3s ease' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
  }}
>
  {/* Content */}
</Card>
```

---

## 🔍 Responsive Breakpoints

```tsx
// Grid columns
<Row xs={1} md={2} xl={3}>  // 1 col mobile, 2 tablet, 3 desktop

// Container widths
style={{ maxWidth: '1400px' }}  // List pages
style={{ maxWidth: '1000px' }}  // Form pages
```

---

## 🎭 Animation Classes

```css
/* Fade in */
.fade-in { animation: fadeIn 0.3s ease-in-out; }

/* Bounce */
.bounce-animation { animation: bounce 2s infinite; }

/* Pulse */
.badge-pulse { animation: pulse 2s infinite; }

/* Hover effects */
.role-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: enhanced;
}
```

---

## 📋 Component Props Checklist

### RoleCard
- ✅ role: Role
- ✅ onEdit: (role: Role) => void
- ✅ onDelete: (role: Role) => void

### RoleForm
- ✅ initialData?: { name, slug, description, permissionIds }
- ✅ permissionsData: GetPermissionsResponse | null
- ✅ onSubmit: (data) => Promise<void>
- ✅ onCancel: () => void
- ✅ isEdit?: boolean
- ✅ loading?: boolean

### PermissionSelector
- ✅ permissions: Permission[]
- ✅ groupedPermissions: PermissionsByModule
- ✅ modules: string[]
- ✅ selectedPermissionIds: string[]
- ✅ onChange: (ids: string[]) => void
- ✅ disabled?: boolean

### DeleteConfirmationModal
- ✅ show: boolean
- ✅ role: Role | null
- ✅ availableRoles: Role[]
- ✅ onConfirm: (roleId, transferToRoleId?) => Promise<void>
- ✅ onCancel: () => void

---

## 🐛 Common Issues & Solutions

### Issue: Error object rendered as text
**Solution:** Extract message dari error object
```typescript
if (typeof errorData === 'object' && 'message' in errorData) {
  errorMessage = errorData.message;
}
```

### Issue: Hover effect tidak smooth
**Solution:** Add transition
```tsx
style={{ transition: 'all 0.3s ease' }}
```

### Issue: Button terlalu kecil di mobile
**Solution:** Use size="lg"
```tsx
<Button size="lg">Text</Button>
```

### Issue: Form fields tidak consistent
**Solution:** Apply standard styling
```tsx
size="lg"
style={{ borderRadius: '8px' }}
```

---

## ✅ Pre-Launch Checklist

- [ ] All error messages display correctly (not objects)
- [ ] Loading states show on all async operations
- [ ] Success messages auto-dismiss
- [ ] Hover effects work smoothly
- [ ] Form validation shows inline errors
- [ ] Empty states have clear CTAs
- [ ] Modals confirm destructive actions
- [ ] Breadcrumb navigation works
- [ ] Responsive at all breakpoints
- [ ] Colors consistent across pages
- [ ] Typography hierarchy clear
- [ ] Spacing uniform throughout
- [ ] Icons properly sized
- [ ] Buttons have min-widths
- [ ] Disabled states clearly visible

---

## 🚀 Quick Commands

```bash
# Start frontend
cd frontend
npm run dev

# Start backend
cd backend
npm run dev

# Access pages
http://localhost:3000/cms/roles           # List
http://localhost:3000/cms/roles/create    # Create
http://localhost:3000/cms/roles/:id/edit  # Edit
```

---

## 📞 Need Help?

1. Check `ROLES_UI_UX_IMPROVEMENTS.md` untuk detailed documentation
2. Review component code untuk implementation details
3. Check `roles.module.css` untuk custom animations
4. Test error scenarios untuk verify handling

---

**Quick Tip:** Semua perubahan fokus pada UI/UX. Backend, API, dan database TIDAK diubah!
