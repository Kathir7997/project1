# Agricart MERN Stack - Complete Deployment Guide

**Frontend:** Vercel (React + Vite)  
**Backend:** Render (Node.js + Express)  
**Database:** MongoDB Atlas  

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Vercel Deployment Configuration](#vercel-deployment-configuration)
3. [Backend (Render) Configuration](#backend-render-configuration)
4. [Frontend API Configuration](#frontend-api-configuration)
5. [CORS Setup](#cors-setup)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Testing & Verification](#testing--verification)
8. [Best Practices](#best-practices)

---

## Environment Setup

### Frontend Environment Variables

Create `.env` file in the `frontend/` directory for **development**:

```env
# Development - uses localhost
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_SEOim7okVIblZC
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
```

Create `.env.production` file in the `frontend/` directory for **production**:

```env
# Production - uses your deployed backend URL
VITE_API_URL=https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_test_SEOim7okVIblZC
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
```

### Backend Environment Variables

Create `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agricart

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_your_secret_key

# AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_SEOim7okVIblZC
RAZORPAY_KEY_SECRET=key_secret_xxxxx

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

---

## Vercel Deployment Configuration

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Select the repository containing your project

### Step 2: Configure Build Settings

In Vercel Project Settings, configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3: Environment Variables in Vercel

Go to **Settings** → **Environment Variables** and add:

```
VITE_API_URL = https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID = rzp_test_SEOim7okVIblZC
VITE_CLERK_PUBLISHABLE_KEY = pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
```

**Important:** Prefix all frontend environment variables with `VITE_` to expose them to the browser.

### Step 4: Verify vercel.json

Your `frontend/vercel.json` should have:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**What this does:**
- **rewrites**: Handles SPA routing (all routes return index.html)
- **headers**: Caches static assets (JS/CSS) forever, but HTML always revalidates

---

## Backend (Render) Configuration

### Step 1: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | agricart-backend |
| **Environment** | Node |
| **Region** | Choose closest to your users |
| **Branch** | main |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |

### Step 2: Environment Variables in Render

Add all backend environment variables in Render dashboard under "Environment".

### Step 3: Verify Backend is Running

```bash
curl https://agricart-2toc.onrender.com/
# Expected response: {"message": "Agricart API is running"}
```

---

## Frontend API Configuration

### 1. Vite Configuration

**frontend/vite.config.js:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // Development proxy - only works locally
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
```

### 2. API Service with Environment Variables

**frontend/src/services/api.js:**

```javascript
import axios from 'axios';
import toast from 'react-hot-toast';

// Use VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('[API] Base URL configured:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for CORS
});

// Request interceptor - Add Clerk token
api.interceptors.request.use(
    async (config) => {
        try {
            if (window.Clerk && window.Clerk.session) {
                const token = await window.Clerk.session.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('[API] Error getting token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized - redirecting to login');
        } else if (error.response?.status === 403) {
            console.error('Forbidden - insufficient permissions');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Check your connection.');
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 3. Using the API in Components

**Example: Fetch Products**

```javascript
import api from '../services/api';
import { useState, useEffect } from 'react';

export function ProductList() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch products');
                console.error('API Error:', err);
            }
        };

        fetchProducts();
    }, []);

    if (error) return <div>Error: {error}</div>;

    return (
        <div className="products-grid">
            {products.map(product => (
                <div key={product._id} className="product-card">
                    <h3>{product.name}</h3>
                    <p>₹{product.price}</p>
                </div>
            ))}
        </div>
    );
}
```

### 4. Accessing Environment Variables

In any component or service:

```javascript
// All VITE_ prefixed variables are available in import.meta.env
const apiUrl = import.meta.env.VITE_API_URL;
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('API URL:', apiUrl);
// Output: API URL: https://agricart-2toc.onrender.com/api (production)
```

---

## CORS Setup

### Backend: Enable CORS for Vercel Frontend

**backend/server.js:**

```javascript
import cors from 'cors';

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Environment Variable

Set in Render:
```
FRONTEND_URL=https://your-app.vercel.app
```

### Testing CORS Locally

```bash
# Development setup (if needed)
# Backend: http://localhost:5000
# Frontend: http://localhost:5173

# Verify CORS headers
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:5000/api/products -v
```

---

## Common Issues & Solutions

### Issue 1: 404 Error on Page Refresh

**Problem:** Navigating to `/consumer/dashboard` works, but refreshing shows 404.

**Cause:** Web server doesn't know about React Router routes.

**Solution:** The `vercel.json` rewrite rule handles this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures all routes return `index.html`, letting React Router handle them.

### Issue 2: CORS Error in Console

**Problem:** 
```
Access to XMLHttpRequest at 'https://agricart-2toc.onrender.com/api/products' 
blocked by CORS policy
```

**Cause:** Backend doesn't allow requests from Vercel frontend.

**Solution:**

1. Update backend CORS in `server.js`:
```javascript
app.use(cors({
    origin: 'https://your-app.vercel.app',
    credentials: true
}));
```

2. Ensure `FRONTEND_URL` is set in Render environment.

3. Rebuild backend after changing CORS settings.

### Issue 3: Environment Variables Not Loading

**Problem:** `import.meta.env.VITE_API_URL` is undefined.

**Causes & Solutions:**

✅ **Variable not prefixed with `VITE_`:**
```javascript
// ❌ Wrong - won't be exposed
REACT_APP_API_URL=...

// ✅ Correct - will be exposed
VITE_API_URL=...
```

✅ **Variable not set in Vercel:**
- Go to Vercel Project Settings → Environment Variables
- Add the variable
- Redeploy (Vercel rebuilds the project)

✅ **Using old environment format:**
```javascript
// ❌ Wrong
process.env.VITE_API_URL

// ✅ Correct
import.meta.env.VITE_API_URL
```

✅ **Debugging:**
```javascript
console.log('All env vars:', import.meta.env);
console.log('API URL:', import.meta.env.VITE_API_URL);
```

### Issue 4: "Not Found /" Error

**Problem:** Homepage shows "Not Found /" or blank page.

**Solutions:**

1. **Check Vercel logs:**
   - Vercel Dashboard → Select Project → Deployments → View Logs
   - Look for build errors

2. **Verify build works locally:**
   ```bash
   cd frontend
   npm run build
   # Check if dist/ folder is created with index.html
   ls dist/
   ```

3. **Check package.json build script:**
   ```json
   {
     "scripts": {
       "build": "vite build"
     }
   }
   ```

4. **Verify index.html exists:**
   ```bash
   ls frontend/index.html
   # Should exist at root, not in src/
   ```

### Issue 5: Blank Page After Deployment

**Problem:** Frontend deploys successfully but shows blank page.

**Solutions:**

1. **Check browser console for errors:**
   - Open DevTools (F12) → Console tab
   - Look for red error messages

2. **Verify API connectivity:**
   ```javascript
   // In browser console
   fetch(import.meta.env.VITE_API_URL + '/products')
       .then(r => r.json())
       .then(d => console.log('Success:', d))
       .catch(e => console.error('Error:', e))
   ```

3. **Check Vercel deployment logs:**
   - Vercel Dashboard → Deployments → Build Logs

4. **Clear Vercel cache and redeploy:**
   - Vercel Dashboard → Deployments → Redeploy

---

## Testing & Verification

### Step 1: Verify Vite Build Locally

```bash
cd frontend
npm run build
npm run preview
# Open http://localhost:5173 in browser
```

### Step 2: Test API Calls

```bash
# Test backend endpoint directly
curl https://agricart-2toc.onrender.com/api/products

# Expected: {"success": true, "data": [...]}
```

### Step 3: Check Environment Variables in Browser

Open DevTools Console and run:

```javascript
console.log('Environment Variables:');
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('All env:', import.meta.env);
```

### Step 4: Network Request Inspection

1. Open DevTools → Network tab
2. Filter by XHR/Fetch requests
3. Click on API request (e.g., `/products`)
4. Check:
   - **Request URL:** Should be your Render backend
   - **Request Headers:** Should include Authorization header
   - **Response Status:** Should be 200 (success) or expected error code
   - **Response Body:** Should have data

### Step 5: CORS Headers Check

```javascript
// In browser console
fetch(import.meta.env.VITE_API_URL + '/products', {
    method: 'GET',
    credentials: 'include'
}).then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', {
        'access-control-allow-origin': r.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': r.headers.get('access-control-allow-credentials'),
    });
    return r.json();
})
.then(d => console.log('Data:', d))
.catch(e => console.error('Error:', e));
```

---

## Best Practices

### 1. Environment Variable Naming

- Use `VITE_` prefix for frontend variables
- Use `VITE_PUBLIC_` prefix for variables that appear in client code
- Backend can use any naming convention

```javascript
// ✅ Good - clearly marked for frontend
VITE_API_URL=...
VITE_RAZORPAY_KEY_ID=...

// ❌ Avoid - generic names
API_URL=...
```

### 2. Separate Development & Production URLs

```env
# .env (development)
VITE_API_URL=http://localhost:5000/api

# .env.production (production)
VITE_API_URL=https://agricart-2toc.onrender.com/api
```

### 3. Use API Service File

Create centralized `api.js` with interceptors:

```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

// Add interceptors here
export default api;
```

Use in components:

```javascript
import api from '../services/api';

const response = await api.get('/products');
```

### 4. Error Handling

```javascript
try {
    const response = await api.get('/products');
    console.log(response.data);
} catch (error) {
    if (error.response?.status === 401) {
        // Handle unauthorized
    } else if (error.response?.status === 404) {
        // Handle not found
    } else if (error.message === 'Network Error') {
        // Handle network issues
    }
}
```

### 5. Caching Strategy

Use `vercel.json` headers for caching:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

- **Static assets (JS/CSS):** Cache forever (immutable)
- **HTML:** Always revalidate (to get latest version)

### 6. Monitoring & Debugging

**Enable detailed logging:**

```javascript
// frontend/src/services/api.js
const api = axios.create({...});

api.interceptors.request.use(config => {
    console.log('[API Request]', config.method.toUpperCase(), config.url);
    return config;
});

api.interceptors.response.use(
    response => {
        console.log('[API Response]', response.status, response.data);
        return response;
    },
    error => {
        console.error('[API Error]', error.response?.status, error.message);
        return Promise.reject(error);
    }
);
```

### 7. Database Connection

For MongoDB Atlas:

```env
# backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agricart

# Important: Add IP whitelist in MongoDB Atlas
# Atlas Dashboard → Network Access → Add IP Address
# For Render: Add 0.0.0.0/0 (allows all IPs) or Render's IP
```

### 8. Secrets Management

**Never commit secrets!**

```bash
# ✅ Use .env files (gitignored)
CLERK_SECRET_KEY=sk_test_xxxxx

# ✅ Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# ❌ Don't commit .env files
```

---

## Quick Deployment Checklist

- [ ] Frontend `.env.production` has correct `VITE_API_URL`
- [ ] Backend `FRONTEND_URL` is set to Vercel URL
- [ ] Vercel environment variables include all `VITE_*` prefixed vars
- [ ] `vercel.json` has SPA routing rewrites
- [ ] Backend CORS allows Vercel domain
- [ ] `frontend/vercel.json` exists (or Vercel uses settings)
- [ ] `npm run build` works locally without errors
- [ ] Backend is running and accessible at deployed URL
- [ ] MongoDB connection string is correct in backend
- [ ] All secrets are in `.env` files, not hardcoded

---

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html
- **Render Docs:** https://render.com/docs
- **Axios Docs:** https://axios-http.com/docs/intro

---

## Example: Complete Flow

### 1. Local Development

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
# Uses proxy to http://localhost:5000/api
```

### 2. Production Deployment

```bash
# Commit and push to GitHub
git add .
git commit -m "Deploy to Vercel and Render"
git push

# Vercel automatically deploys frontend
# Render automatically deploys backend
```

### 3. Frontend Calls Backend

```javascript
// frontend/src/services/api.js uses import.meta.env.VITE_API_URL
// Production: https://agricart-2toc.onrender.com/api
// Development: http://localhost:5000/api (via proxy)

// Component
const response = await api.get('/products');
```

---

**Last Updated:** 2026-02-11  
**Status:** Ready for Production Deployment
