# Browns Company - Maintenance Management System

A modern, responsive frontend-only Maintenance Management System built with React, Vite, and Tailwind CSS for Browns Company.

## Features

### 🎯 Core Functionalities

- **Role-Based Access Control**: Separate dashboards for Manager, Engineer, and Staff
- **Landing Page**: Professional introduction with feature overview
- **Authentication**: Mock login system with three demo roles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Blue and yellow color palette inspired by Browns branding
- **Smooth Animations**: Framer Motion animations and transitions

### 👥 User Roles

#### Manager Dashboard
- Dashboard overview with statistics
- Employee account verification
- Work item and schedule management
- System logs viewing
- Internal messaging
- User management

#### Engineer Dashboard
- Assigned work items tracking
- Schedule viewer
- Notifications for work updates
- Internal messaging
- Profile management

#### Staff Dashboard
- Schedule viewer
- Notifications
- Messages
- Profile management

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Animations**: Framer Motion
- **Language**: TypeScript

## Getting Started

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Open your browser**:
Navigate to `http://localhost:5173`

### Demo Credentials

- **Manager**: manager@browns.com / 123456
- **Engineer**: engineer@browns.com / 123456
- **Staff**: staff@browns.com / 123456

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── components/
│   ├── common/       # Reusable UI components
│   └── shared/       # Layout components
├── pages/            # Page components
├── layouts/          # Layout wrappers
├── routes/           # Routing logic
├── context/          # React Context
├── services/         # API services
├── mock/             # Mock data
├── hooks/            # Custom hooks
└── assets/           # Static assets
```

## API Integration

Services are prepared for backend integration:
- `services/api.ts` - Axios configuration
- `services/authService.ts` - Authentication
- `services/dataService.ts` - Data operations
- `services/userService.ts` - User management

---

**Built with ❤️ using React + Vite + Tailwind CSS**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   The project includes basic environment files:
   - `.env` (default local environment)
   - `.env.development` (development environment overrides)
   - `.env.production` (production environment overrides)
   
   Adjust `VITE_API_URL` or other variables in these files as needed for your specific setup.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

## Building for Production
To create a production build, run:
```bash
npm run build
```
The built files will be located in the `dist` directory.

## Project Structure
- `src/` - Contains the React source files (`.jsx`, `.css`, etc.).
- `public/` - Static assets.
- `index.html` - The main entry point.
- `package.json` - Project metadata and dependencies.
- `vite.config.js` - Configuration file for Vite.
