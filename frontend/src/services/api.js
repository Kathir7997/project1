import axios from 'axios';
import toast from 'react-hot-toast';
import { getClerkToken } from './tokenManager';

// API base URL - uses environment variable or falls back to localhost for development
// Ensure proper formatting: should be http://localhost:5000/api (with /api suffix)
const API_BASE_URL = (() => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
        const normalizedUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;

        if (normalizedUrl.endsWith('/api') || normalizedUrl.includes('/api/')) {
            return normalizedUrl;
        }

        return `${normalizedUrl}/api`;
    }
    return 'http://localhost:5000/api';
})();

console.log('[API] VITE_API_URL environment:', import.meta.env.VITE_API_URL);
console.log('[API] Base URL configured:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor - Add Clerk token to headers
api.interceptors.request.use(
    async (config) => {
        try {
            // Get token from TokenManager (which has access to Clerk's getToken)
            const token = await getClerkToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('[API] Clerk token attached to request');
            } else {
                // Fallback to localStorage for backward compatibility or during migration
                const userStr = localStorage.getItem('farmcart_user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    config.headers['x-user-id'] = user.id;
                    config.headers['x-user-role'] = user.role;
                    console.log('[API] Using localStorage fallback auth');
                }
            }
        } catch (error) {
            console.error('[API] Error getting auth token:', error.message);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error codes with better messaging
            const status = error.response.status;
            const message = error.response.data?.message;
            const errorDetail = error.response.data?.error;

            console.error(`[API] Error ${status}:`, message, errorDetail);

            // Don't show some errors as toasts - let components handle them
            if (status === 401) {
                console.warn('[API] Unauthorized - user needs to login');
            } else if (status === 403) {
                console.warn('[API] Forbidden - user lacks required role');
            } else if (status === 500 || status === 502 || status === 503) {
                // Only show server errors once
                if (!window.__lastServerErrorShown || Date.now() - window.__lastServerErrorShown > 5000) {
                    toast.error(message || 'Server error. Please try again.');
                    window.__lastServerErrorShown = Date.now();
                }
            }

            return Promise.reject(error.response.data);
        }

        // Network error
        console.error('[API] Network error:', error.message);
        if (error.message === 'Network Error') {
            toast.error('Network error. Check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
