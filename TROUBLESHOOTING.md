# Vercel & Render Troubleshooting Guide

Complete solutions for common deployment issues.

---

## Table of Contents

1. [Frontend Issues (Vercel)](#frontend-issues-vercel)
2. [Backend Issues (Render)](#backend-issues-render)
3. [API Connection Issues](#api-connection-issues)
4. [CORS Issues](#cors-issues)
5. [Environment Variables Issues](#environment-variables-issues)
6. [Performance Issues](#performance-issues)
7. [Debugging Tools & Logs](#debugging-tools--logs)

---

## Frontend Issues (Vercel)

### Problem: 404 Error on Page Refresh

**Symptoms:**
- Navigating to `/products` works initially
- Refreshing page shows "404 Not Found"
- All routes work in development but not production

**Root Cause:**
Vercel doesn't know about React Router routes. Requests go to the server, which returns 404.

**Solution:**

1. Verify `frontend/vercel.json` exists with:
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

2. Check Vercel settings (Settings → General → Framework Preset):
   - Should be "Vite" or "Other"
   - Build command: `npm run build`
   - Output: `dist`
   - Root directory: `frontend`

3. Redeploy:
   ```bash
   # Option 1: Push to GitHub
   git push

   # Option 2: Redeploy in Vercel
   # Dashboard → Deployments → Click ... → Redeploy
   ```

4. Verify build includes `dist/index.html`:
   ```bash
   cd frontend
   npm run build
   ls dist/index.html
   # Should exist
   ```

**Testing:**
```bash
# After deployment
curl https://your-app.vercel.app/any-route
# Should return HTML (not 404)
```

---

### Problem: Blank Page After Deployment

**Symptoms:**
- Homepage loads
- Console shows errors
- Layout/styles missing or broken

**Checklist:**

1. **Check Browser Console (F12 → Console):**
   - Note any red error messages
   - Search for "Cannot find module"
   - Search for "CORS"

2. **Verify Environment Variables:**
   ```javascript
   // In browser console
   console.log(import.meta.env);
   console.log(import.meta.env.VITE_API_URL);
   // Should show your backend URL, not undefined
   ```

3. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Failed deployment → Build Logs
   - Look for build errors

4. **Test Vite Build Locally:**
   ```bash
   cd frontend
   npm run build
   # Check for errors
   npm run preview
   # Open http://localhost:5173 - should look correct
   ```

5. **Check CSS Loading:**
   - DevTools → Network tab
   - Filter by CSS files
   - Should all load with 200 status
   - If 404, check Tailwind CSS configuration

6. **Verify Clerk Setup:**
   - Check VITE_CLERK_PUBLISHABLE_KEY is set
   - In browser console:
     ```javascript
     console.log(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
     ```

**Fix CSS Issues:**
```bash
# Rebuild CSS
cd frontend
npm run build
# Check if dist/index.html includes <style> tags or links to CSS files
```

---

### Problem: "npm run build" Fails Locally

**Symptoms:**
```
error TS2688: Cannot find type definition file for 'node'
error: Build failed
```

**Solution:**

```bash
cd frontend

# Clear cache
rm -rf node_modules dist
npm cache clean --force

# Reinstall dependencies
npm install

# Try build again
npm run build
```

**If still failing:**
```bash
# Check build command works
npm run build -- --verbose

# Check package.json has build script
cat package.json | grep -A2 '"build"'
```

---

### Problem: Styles/Tailwind CSS Not Loading

**Symptoms:**
- Page loads but no styling
- Colors/layout wrong
- Only in production, works locally

**Root Cause:**
Tailwind CSS build issue or CSS not included in dist.

**Solution:**

1. Verify `frontend/tailwind.config.js` includes all template paths:
   ```javascript
   module.exports = {
     content: [
       "./index.html",
       "./src/**/*.{js,jsx}",  // Ensure this is present
     ],
     theme: { extend: {} },
     plugins: [],
   }
   ```

2. Verify `frontend/src/index.css` imports Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Rebuild and verify CSS is in dist:
   ```bash
   cd frontend
   npm run build
   # Check if dist contains CSS
   ls dist/*.css
   # Should list CSS files
   ```

4. Redeploy to Vercel:
   ```bash
   git add .
   git commit -m "Fix Tailwind CSS"
   git push
   ```

---

## Backend Issues (Render)

### Problem: Backend Service Keeps Crashing

**Symptoms:**
- Backend starts then immediately stops
- "Deploy failed" in Render
- Can't access API

**Debugging:**

1. **Check Render Logs:**
   - Render Dashboard → Your Service → Logs
   - Look for error messages

2. **Common issues:**
   ```
   Error: Cannot find module 'express'
   → Solution: npm install not running
   
   Error: connect ECONNREFUSED
   → Solution: MongoDB URI wrong or database down
   
   Error: SIGTERM
   → Solution: Long-running operation, normal on redeploy
   ```

3. **Fix if npm install not running:**
   - Settings → Build & Deploy
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

4. **Fix MongoDB connection:**
   ```bash
   # Test connection locally first
   # Then verify URI in Render environment variables
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/agricart
   
   # Common fixes:
   # - Add IP whitelist: 0.0.0.0/0
   # - Check username/password
   # - Create database/collection if needed
   ```

---

### Problem: Cannot Connect to MongoDB

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
MongooseError: Cannot connect to database
```

**Solution:**

1. **Check MongoDB Connection String:**
   ```javascript
   // Should be MongoDB Atlas URL, not localhost
   ❌ Wrong: mongodb://localhost:27017/agricart
   ✅ Correct: mongodb+srv://user:pass@cluster.mongodb.net/agricart
   ```

2. **Verify in Render Environment:**
   - Render Dashboard → Your Service → Environment
   - Check `MONGODB_URI` value is complete
   - No spaces or line breaks

3. **MongoDB Atlas Setup:**
   - Go to MongoDB Atlas → Clusters
   - Click "Connect"
   - Copy connection string
   - Replace `<password>` with actual password
   - Make sure network access includes 0.0.0.0/0

4. **Test locally with same URI:**
   ```bash
   # In backend folder
   export MONGODB_URI="your_connection_string"
   npm start
   # Should connect successfully
   ```

---

### Problem: API Endpoints Return 500 Error

**Symptoms:**
```
GET https://backend-url/api/products
Response: 500 Internal Server Error
```

**Debugging:**

1. **Check Render Logs:**
   - Render Dashboard → Logs
   - Will show error details

2. **Common issues:**
   ```
   TypeError: Cannot read property 'something' of undefined
   → Check request validation/error handling
   
   Error: User not found
   → Check Clerk authentication middleware
   
   Cast error: Invalid ObjectId
   → Check MongoDB query/parameters
   ```

3. **Add better error handling:**
   ```javascript
   // backend/server.js - Add error middleware
   app.use((err, req, res, next) => {
     console.error('Error:', err);
     res.status(500).json({
       success: false,
       message: err.message,
       error: process.env.NODE_ENV === 'development' ? err : {}
     });
   });
   ```

---

## API Connection Issues

### Problem: Frontend Can't Reach Backend

**Symptoms:**
```
Fetch Error: Failed to fetch
Network Error: Cannot reach server
```

**Debugging Steps:**

1. **Verify backend is running:**
   ```bash
   curl https://agricart-2toc.onrender.com/
   # Should return: {"message": "Agricart API is running"}
   ```

2. **Check environment variable:**
   ```javascript
   // Browser console
   console.log(import.meta.env.VITE_API_URL);
   // Should show: https://agricart-2toc.onrender.com/api
   ```

3. **Test API from browser console:**
   ```javascript
   fetch('https://agricart-2toc.onrender.com/api/products')
       .then(r => r.json())
       .then(d => console.log(d))
       .catch(e => console.error(e))
   ```

4. **Check if backend URL is correct:**
   - Render Dashboard → Your Service → Environment
   - Copy the URL from "Render URL" field (not settings)
   - Should be like: `https://service-name-xxxx.onrender.com`

**Solution:**

1. Update `VITE_API_URL` in Vercel:
   - Vercel Dashboard → Settings → Environment Variables
   - Set: `VITE_API_URL = https://correct-backend-url/api`
   - Redeploy

2. Verify in code:
   ```javascript
   // frontend/src/services/api.js
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   console.log('Using API URL:', API_BASE_URL);
   ```

---

### Problem: 401 Unauthorized on Every Request

**Symptoms:**
```
Error: 401 Unauthorized
Cannot create product / place order
```

**Causes:**
- No Clerk token sent
- Clerk configuration wrong
- Backend not verifying token correctly

**Solution:**

1. **Verify Clerk is configured:**
   ```javascript
   // frontend/src/main.jsx
   import { ClerkProvider } from '@clerk/clerk-react';
   
   const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
   
   root.render(
     <ClerkProvider publishableKey={publishableKey}>
       <App />
     </ClerkProvider>,
     document.getElementById('root'),
   );
   ```

2. **Check token is being sent:**
   ```javascript
   // frontend/src/services/api.js
   api.interceptors.request.use(config => {
       console.log('[API] Request headers:', config.headers);
       return config;
   });
   ```

3. **Verify backend middleware:**
   ```javascript
   // backend/middleware/authMiddleware.js
   import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
   
   export const protect = ClerkExpressRequireAuth();
   ```

4. **Check Clerk keys:**
   - Vercel: `VITE_CLERK_PUBLISHABLE_KEY`
   - Render: `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
   - All must match your Clerk application

---

## CORS Issues

### Problem: CORS Error in Browser Console

**Symptoms:**
```
Access to XMLHttpRequest at 'https://backend-url/api/products'
blocked by CORS policy: No 'Access-Control-Allow-Origin' header
```

**Root Cause:**
Backend doesn't allow requests from your Vercel domain.

**Solution:**

1. **Update backend CORS:**
   ```javascript
   // backend/server.js
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **Set FRONTEND_URL in Render:**
   - Render Dashboard → Your Service → Environment
   - Add: `FRONTEND_URL = https://your-app.vercel.app`
   - Redeploy backend

3. **Verify CORS headers:**
   ```bash
   # Test CORS headers
   curl -i -H "Origin: https://your-app.vercel.app" \
     https://backend-url/api/products
   
   # Should include:
   # access-control-allow-origin: https://your-app.vercel.app
   # access-control-allow-credentials: true
   ```

4. **For local development with different ports:**
   ```javascript
   // Allow both localhost:5173 and actual frontend domain
   const allowedOrigins = [
     'http://localhost:5173',
     'http://localhost:3000',
     process.env.FRONTEND_URL
   ].filter(Boolean);
   
   app.use(cors({
     origin: allowedOrigins,
     credentials: true
   }));
   ```

---

### Problem: Preflight Request (OPTIONS) Failing

**Symptoms:**
```
OPTIONS https://backend-url/api/products 403 Forbidden
```

**Solution:**
```javascript
// backend/server.js - Add BEFORE routes
app.options('*', cors());

// Or for specific routes
app.options('/api/*', cors());
```

---

## Environment Variables Issues

### Problem: Environment Variable is `undefined`

**Symptoms:**
```javascript
console.log(import.meta.env.VITE_API_URL);
// Output: undefined
```

**Checklist:**

1. **Variable name must start with `VITE_`:**
   ```env
   ✅ VITE_API_URL=...
   ❌ API_URL=...
   ❌ REACT_APP_API_URL=...
   ```

2. **Variable must be in Vercel Settings:**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Not in local `.env` or `.env.production` files
   - Those are for local development only

3. **Check file location:**
   ```bash
   # Local development - frontend/.env or frontend/.env.local
   # Production - set in Vercel dashboard
   
   # NOT in root .env or root .env.production
   ```

4. **Redeploy after adding variables:**
   - Vercel doesn't rebuild if you only add env vars
   - Must trigger redeployment:
     ```bash
     git push
     # or manually redeploy in Vercel dashboard
     ```

5. **Verify build includes the variable:**
   ```bash
   cd frontend
   npm run build
   # Check if variable is in dist/index.html or dist/js/main.js
   ```

### Problem: Environment Variable Wrong in Production

**Symptoms:**
- Local: `VITE_API_URL = http://localhost:5000/api` ✅
- Production: `VITE_API_URL = http://localhost:5000/api` ❌ (should be Render URL)

**Solution:**

1. **Create `.env.production` for local builds:**
   ```env
   # frontend/.env.production
   VITE_API_URL=https://agricart-2toc.onrender.com/api
   ```

2. **Set different variable in Vercel:**
   - Vercel Dashboard → Environment Variables
   - Set for "Production" environment only
   - Leave "Preview" and "Development" different if needed

3. **Test locally:**
   ```bash
   cd frontend
   # Development
   npm run dev  # Uses .env
   
   # Production build
   npm run build
   npm run preview  # Uses .env.production
   ```

---

## Performance Issues

### Problem: Site Takes Long Time to Load

**Symptoms:**
- First load takes 10+ seconds
- Subsequent loads fast

**Causes:**
- Backend cold start on Render
- Large JavaScript bundle
- Missing caching headers

**Solutions:**

1. **Reduce JavaScript bundle:**
   ```bash
   npm install -D vite-plugin-visualizer
   
   # Check bundle size
   npm run build
   # Opens visualization of bundle
   ```

2. **Enable Vercel caching:**
   - Already configured in `vercel.json`
   - Verify headers section:
   ```json
   {
     "headers": [
       {
         "source": "/assets/(.*)",
         "headers": [
           {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}
         ]
       }
     ]
   }
   ```

3. **Warm up backend:**
   - Render free tier goes to sleep
   - First request takes longer
   - Use monitoring service to ping backend periodically

4. **Optimize images:**
   ```bash
   # Compress before uploading
   # Use CDN for image hosting
   ```

---

## Debugging Tools & Logs

### Vercel Deployment Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs

# Or in dashboard:
# Dashboard → Project → Deployments → Select deployment → Logs
```

### Render Application Logs

```bash
# In Render dashboard:
# Your Service → Logs
# Shows all console.log and errors
```

### Local Development Debugging

```javascript
// frontend/src/services/api.js
api.interceptors.request.use(config => {
  console.log('[API Request]', {
    method: config.method.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    headers: config.headers
  });
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('[API Response]', response.status, response.data);
    return response;
  },
  error => {
    console.error('[API Error]', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

### Browser DevTools

```javascript
// Console Debugging
console.log('API URL:', import.meta.env.VITE_API_URL);

// Network Tab
// DevTools → Network
// Filter by XHR/Fetch
// Check request/response details

// Storage Tab
// Check localStorage for auth tokens
// Check sessionStorage
```

---

## Quick Fixes Checklist

- [ ] Clear browser cache: `Ctrl+Shift+Del` or `Cmd+Shift+Del`
- [ ] Hard refresh: `Ctrl+F5` or `Cmd+Shift+R`
- [ ] Check Vercel/Render environment variables set correctly
- [ ] Redeploy to Vercel and Render
- [ ] Verify backend URL is correct and accessible
- [ ] Check CORS headers allow frontend domain
- [ ] Look at build logs for errors
- [ ] Check browser console for JavaScript errors
- [ ] Test API endpoint directly with curl
- [ ] Verify Clerk is configured correctly

---

**Last Updated:** 2026-02-11  
**Status:** Comprehensive Troubleshooting Guide
