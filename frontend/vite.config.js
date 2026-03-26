import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // Dev server proxy for API calls
        // This proxies /api requests to the backend during development
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
    // Environment variables are automatically loaded from:
    // .env (for all environments)
    // .env.local (for local overrides, gitignored)
    // .env.production (for production builds)
    // .env.development (for development)
    // Variables prefixed with VITE_ are exposed to the frontend
});
