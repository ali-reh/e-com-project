# E-Commerce Project

A full-stack e-commerce application with a modern tech stack, featuring product catalog management, shopping cart functionality, user authentication, and order processing.

## Tech Stack

### Backend
- **Runtime**: Node.js with ESM modules
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js v5.2.1
- **Database**: Supabase (PostgreSQL)
- **Authentication**: bcrypt password hashing
- **Email Service**: Nodemailer with Gmail SMTP
- **Build Tool**: TypeScript Compiler (tsc)

### Frontend
- **Markup**: HTML5
- **Styling**: CSS3
- **Scripting**: Vanilla JavaScript (ES6+)
- **Cart Management**: Client-side state management
- **Admin Dashboard**: Secure authentication & CRUD operations

### DevOps & Deployment
- **Deployment**: Vercel (automatic CI/CD)
- **Package Manager**: npm with lock file for reproducible builds
- **Version Control**: Git
- **Environment**: Node.js v25+

## Key Features

- Product catalog with categories and filtering
- Shopping cart with persistent storage
- User authentication & admin dashboard
- Order management system
- Email notifications (order confirmations, contact form)
- Responsive design
- Search functionality

## Build & Run

```bash
# Install dependencies
npm install

# Build (TypeScript compilation)
npm run build

# Start production server
npm start

# Development mode with hot reload
npm dev

# Type checking
npm typecheck
```

## Project Structure

- `src/` - Backend TypeScript code (Express routes, controllers, models, middleware)
- `public/` - Frontend static assets (HTML, CSS, JavaScript)
- `dist/` - Compiled JavaScript output (auto-generated)

---

*This project demonstrates full-stack JavaScript/TypeScript development with modern web technologies and cloud infrastructure.*
