# LinkNet Corp - Full Stack Web Application

Modern full-stack web application built with Next.js 14+ and Express.js, powered by TypeScript and Bootstrap 5.

## 🚀 Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Bootstrap 5** - UI framework
- **React Bootstrap** - Bootstrap components for React
- **Axios** - HTTP client
- **SWR** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **JWT** - Authentication
- **Helmet** - Security middleware
- **Morgan** - Logging
- **Express Validator** - Input validation
- **Rate Limiting** - API protection

## 📁 Project Structure

```
linknetcorp_next_express/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── server.ts        # Entry point
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Libraries and utilities
│   ├── public/              # Static assets
│   ├── types/               # TypeScript types
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd linknetcorp_next_express
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configurations
# Update database credentials, JWT secrets, etc.

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configurations
# Update API URL and other settings

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Frontend will run on `http://localhost:3000`

## 📝 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

### Frontend Scripts
```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run Next.js linter
npm run lint:fix     # Fix linting errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript compiler check
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT
- `DATABASE_URL` - Database connection string
- `CORS_ORIGIN` - Allowed CORS origin

#### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_URL` - Frontend URL

### TypeScript Path Aliases

#### Backend
- `@controllers/*` → `src/controllers/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@middleware/*` → `src/middleware/*`
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@config/*` → `src/config/*`
- `@types/*` → `src/types/*`

#### Frontend
- `@/*` → Root directory
- `@/components/*` → `components/*`
- `@/lib/*` → `lib/*`
- `@/hooks/*` → `hooks/*`
- `@/types/*` → `types/*`
- `@/app/*` → `app/*`

## 🧪 Testing

Both frontend and backend are configured with Jest for testing.

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🔒 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Helmet.js for security headers
- ✅ Rate limiting for API endpoints
- ✅ Input validation with express-validator
- ✅ CORS configuration
- ✅ JWT authentication
- ✅ Password hashing with bcrypt

## 📚 Code Quality

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** (optional) - Git hooks for pre-commit checks

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

LinkNet Corp Development Team

## � Modules & Features

### Content Management System (CMS)

#### Page Management
- **Full CRUD** - Create, read, update, delete pages
- **SEO Optimization** - Meta title, description, keywords, OG images
- **Template System** - Default, Full Width, Landing page layouts
- **Slug Management** - Auto-generation, validation, uniqueness check
- **Status Workflow** - Draft and published states
- **Component Builder** - Dynamic page building with drag-drop interface

📚 **Documentation:**
- [Quick Start Guide](PAGE_MANAGEMENT_QUICK_START.md)
- [Complete Documentation](PAGE_MANAGEMENT_README.md)
- [Implementation Summary](PAGE_MANAGEMENT_IMPLEMENTATION_SUMMARY.md)

#### Component System
- **13 Component Types** - Hero, Text, Gallery, CTA, Video, Accordion, Tabs, Testimonials, Team, Stats, Pricing, Contact, News, Custom HTML
- **JSON Schema Validation** - Automatic validation dengan Ajv
- **Drag-Drop Builder** - Visual component arrangement
- **Dynamic Form Generator** - Auto-generate forms from JSON schemas
- **Visibility Toggle** - Show/hide components without delete
- **Component Preview** - Preview before publish
- **Public Rendering** - Display components on public pages
- **Lazy Loading** - Performance optimization
- **Scroll Animations** - Framer Motion animations

📚 **Documentation:**
- [Quick Start Guide](COMPONENT_SYSTEM_QUICK_START.md)
- [Implementation Summary](COMPONENT_SYSTEM_SUMMARY.md)
- [Completion Summary](COMPONENT_SYSTEM_COMPLETION.md)
- [Quick Reference](PAGE_COMPONENT_QUICK_REFERENCE.md)

#### Dynamic Page Rendering (NEW! 🎉)
- **SSG/ISR Strategy** - Static generation with revalidation
- **Catch-All Routing** - `/page/[slug]` and `/[slug]` routes
- **Preview Mode** - Preview draft pages with secret
- **SEO Optimization** - Auto-generate meta tags
- **Component Rendering** - 13 rendering components
- **Animations** - Scroll-triggered animations
- **Performance** - Lazy loading, code splitting
- **Error Handling** - Custom 404 and 500 pages

📚 **Documentation:**
- [Quick Start Guide](DYNAMIC_PAGE_QUICK_START.md)
- [Complete Guide](DYNAMIC_PAGE_RENDERING_GUIDE.md)

#### Menu Management
- Hierarchical menu structure
- Multi-language support
- Internal/external links
- Drag-and-drop ordering
- Status management

#### Role & Permission Management (RBAC)
- Role-based access control
- Granular permissions
- User-role assignment
- System roles protection

#### User Management
- User CRUD operations
- Profile management
- Status management
- Activity logging

#### File Manager
- File upload/download
- Folder management
- File search & filter
- Access control

#### Settings System
- Global settings management
- Environment configuration
- Public/private settings
- Group-based organization

## �📞 Support

For support, email support@linknetcorp.com or open an issue in the repository.

---

**Happy Coding! 🚀**
