# Setup Instructions - Browns Company Maintenance Management System

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Icons
- Framer Motion

### 2. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### 3. Login with Demo Credentials

Choose one of the following demo accounts:

**Manager Account**
```
Email: manager@browns.com
Password: 123456
```
Access: Manager Dashboard, employee verification, work management, system logs

**Engineer Account**
```
Email: engineer@browns.com
Password: 123456
```
Access: Engineer Dashboard, assigned work items, schedule, notifications

**Staff Account**
```
Email: staff@browns.com
Password: 123456
```
Access: Staff Dashboard, schedule viewer, messages

### 4. Test the Application

- Navigate through different pages
- Test the responsive design on mobile/tablet
- Check all dashboard features
- Try logging out and logging back in
- Test role-based access (try accessing `/manager` as an engineer)

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

To preview:
```bash
npm run preview
```

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Project Architecture

### Frontend Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
├── index.css              # Global styles
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Form.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   └── shared/            # Layout components
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── manager/
│   │   └── ManagerDashboard.tsx
│   ├── engineer/
│   │   └── EngineerDashboard.tsx
│   └── staff/
│       └── StaffDashboard.tsx
├── layouts/
│   └── DashboardLayout.tsx
├── routes/
│   ├── ProtectedRoute.tsx
│   └── RoleBasedRedirect.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── dataService.ts
│   └── userService.ts
├── mock/
│   ├── users.ts
│   └── data.ts
├── hooks/
│   └── useAuthContext.ts
└── assets/
```

## Key Features Implemented

### 1. Authentication System
- Mock login with three roles
- JWT token simulation
- Session persistence with localStorage
- Protected routes
- Automatic logout on unauthorized access

### 2. Role-Based Access Control
- Manager: Full system access
- Engineer: Work items and schedule management
- Staff: View-only schedule and messages

### 3. Responsive Design
- Mobile-first approach
- Mobile menu toggle
- Tailored layouts for all screen sizes
- Touch-friendly interface

### 4. Component Architecture
- Reusable, composable components
- Props-based customization
- Clean prop interfaces with TypeScript
- Proper separation of concerns

### 5. State Management
- React Context API for authentication
- Component-level state for UI interactions
- Mock data stored in memory

### 6. API Ready
- Axios service layer prepared
- Interceptors for auth tokens
- Modular service organization
- Easy backend integration

## Backend Integration

To connect to a real backend:

1. **Update API URL** in `.env`:
```
VITE_API_URL=https://your-api.com/api
```

2. **Update service files** to use Axios:
```typescript
// Example: services/dataService.ts
export const workItemService = {
  async getWorkItems() {
    const response = await apiClient.get("/work-items");
    return response.data;
  }
}
```

3. **Update auth flow** for real token handling

## Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {...},
  accent: {...},
}
```

### Add New Routes
Update `src/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

### Add New Components
1. Create component in `src/components/common/` or `src/components/shared/`
2. Export from component file
3. Import and use in pages

## Troubleshooting

### Dependencies not installing
```bash
rm -rf node_modules
npm install
```

### Port already in use
Vite will automatically use the next available port (5174, 5175, etc.)

### TypeScript errors
Run type checking:
```bash
npm run type-check
```

### Build errors
Clear cache and rebuild:
```bash
rm -rf dist
npm run build
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

1. Lazy load routes with React.lazy()
2. Optimize images in production
3. Use production build for testing
4. Monitor bundle size with source maps

## Next Steps

1. Test all functionality thoroughly
2. Prepare backend API
3. Implement real authentication
4. Add more advanced features (charts, exports, etc.)
5. Deploy to hosting platform

## Support

For issues or questions:
1. Check the main README.md
2. Review component props and interfaces
3. Check console for error messages
4. Verify mock data in `src/mock/` directory

## Version Information

- React: 19.x
- Vite: 8.x
- Tailwind CSS: 3.4.x
- TypeScript: 6.x

---

Happy coding! 🚀
