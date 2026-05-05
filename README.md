# Frontend Management Project

This project was bootstrapped with [Vite](https://vitejs.dev/) and uses React with JSX.

## Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

## Getting Started

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
