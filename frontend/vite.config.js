import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // Dev server proxy for API calls
        // This allows frontend to call /api/endpoint during development
        // Requests to /api/* are forwarded to http://localhost:5000
        // This eliminates CORS issues during development
        // 
        // How it works:
        // Frontend requests: http://localhost:5173/api/products
        // Gets proxied to: http://localhost:5000/api/products
        // 
        // In production (Vercel), this proxy doesn't apply
        // Instead, import.meta.env.VITE_API_URL is used from environment variables
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                // Optional: rewrite the path
                // rewrite: (path) => path.replace(/^\/api/, '/api'),
            },
        },
    },
    
    build: {
        // Optimize build for production
        target: 'esnext',
        minify: 'terser',
        sourcemap: false,
    },
    
    // Environment variables configuration
    // Variables from .env files are automatically loaded by Vite
    // 
    // Loading priority (highest to lowest):
    // 1. .env.{mode}.local (e.g., .env.production.local) - git ignored
    // 2. .env.{mode} (e.g., .env.production)
    // 3. .env.local - git ignored
    // 4. .env
    //
    // IMPORTANT: Only variables prefixed with VITE_ are exposed to frontend code
    // Example:
    // ✅ VITE_API_URL=... → accessible via import.meta.env.VITE_API_URL
    // ❌ API_URL=... → NOT accessible (won't be exposed)
    // ❌ REACT_APP_API_URL=... → NOT accessible (wrong prefix)
    //
    // Accessing in code:
    // const apiUrl = import.meta.env.VITE_API_URL;
    // console.log(apiUrl);
    // 
    // In development (npm run dev):
    //   - Uses .env and .env.local if present
    //   - Falls back to values in .env
    //
    // In production (npm run build):
    //   - Uses .env.production and .env.production.local if present
    //   - Falls back to values in .env.production
    //   - VERCEL OVERRIDES these with values from dashboard
});

