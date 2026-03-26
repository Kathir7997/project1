# Vercel API Proxy Configuration Update

## ✅ What Changed

Your `frontend/vercel.json` now includes **API rewriting** directly at Vercel's edge, which is better than relying solely on CORS.

---

## 📝 New vercel.json Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://agricart-2toc.onrender.com/api/:path*"
    },
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

---

## 🎯 How It Works

### Before (CORS-Only)
```
Browser at: https://your-app.vercel.app
  ↓
Frontend makes request to: https://agricart-2toc.onrender.com/api/products
  ↓
CORS headers checked
  ↓
Request allowed/blocked
```

### After (API Rewrite + CORS)
```
Browser at: https://your-app.vercel.app
  ↓
Frontend makes request to: https://your-app.vercel.app/api/products
  ↓
Vercel Edge rewrites to: https://agricart-2toc.onrender.com/api/products
  ↓
Request proxied through Vercel (same domain in browser!)
  ↓
No CORS issues!
```

---

## ✨ Benefits of This Approach

1. **✅ No CORS Issues**
   - Browser thinks it's same domain
   - Vercel handles the proxying

2. **✅ Better Performance**
   - Vercel's global network
   - Cached responses possible
   - Faster routing

3. **✅ Security**
   - Backend URL hidden from browser
   - Only `/api/*` routes proxied
   - Other routes serve index.html (SPA)

4. **✅ Flexibility**
   - Can change backend URL without frontend changes
   - Easier migration
   - Load balancing ready

---

## 📋 How to Update Code

### Option A: Keep Using Full URL (Still Works)

```javascript
// This still works because Vercel rewrites /api to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});
```

### Option B: Use Relative Path (Simpler)

```javascript
// Simpler - no need for environment variable!
const api = axios.create({
    baseURL: '/api',  // Vercel rewrites this to backend
});
```

### Option C: Environment Variable (Recommended)

```javascript
// Still use environment variable for flexibility
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// In .env:
VITE_API_URL=/api  (development with proxy)

// In .env.production:
VITE_API_URL=/api  (Vercel uses vercel.json rewrite)
```

---

## 🔧 Updated Configuration Files

### Update: frontend/.env
```env
# Development - uses Vite proxy
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_SEOim7okVIblZC
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Note:** The `/api` is proxied by Vite dev server to `http://localhost:5000/api`

### Update: frontend/.env.production
```env
# Production - uses Vercel rewrite to backend
VITE_API_URL=/api
VITE_RAZORPAY_KEY_ID=rzp_test_SEOim7okVIblZC
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Note:** The `/api` is rewritten by Vercel to `https://agricart-2toc.onrender.com/api`

### No Change Needed: frontend/vite.config.js
```javascript
// Dev proxy still works - intercepts /api requests
proxy: {
    '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
    },
}
```

---

## 📊 Routing Flow

```
DEVELOPMENT (npm run dev)
└─ Frontend request: /api/products
   └─ Vite proxy intercepts
   └─ Forwards to: http://localhost:5000/api/products
   └─ Backend responds

PRODUCTION (Vercel)
└─ Frontend request: https://your-app.vercel.app/api/products
   └─ Vercel rewrites (vercel.json)
   └─ Forwards to: https://agricart-2toc.onrender.com/api/products
   └─ Backend responds (same domain in browser!)
```

---

## 🔐 CORS Still Recommended

Even with Vercel rewriting, keep CORS configured in backend:

```javascript
// backend/server.js
app.use(cors({
    origin: [
        'http://localhost:5173',  // Dev
        'https://your-app.vercel.app'  // Production
    ],
    credentials: true
}));
```

**Why?** 
- Vercel rewrite is transparent to browser
- But backend still sees original origin in headers
- CORS headers provide extra security layer

---

## ✅ Updated API Service

Your `frontend/src/services/api.js` now works better:

```javascript
import axios from 'axios';

// Use relative path - works for both dev and production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('[API] Base URL configured:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Interceptors work as before
api.interceptors.request.use(async (config) => {
    try {
        if (window.Clerk?.session) {
            const token = await window.Clerk.session.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (error) {
        console.error('[API] Error getting token:', error);
    }
    return config;
});

export default api;
```

---

## 🧪 Testing the Configuration

### Local Development
```bash
cd frontend
npm run dev

# In browser:
curl http://localhost:5173/api/products
# Proxied to http://localhost:5000/api/products ✓
```

### Production
```bash
# After deployment to Vercel
curl https://your-app.vercel.app/api/products
# Rewritten to https://agricart-2toc.onrender.com/api/products ✓
```

---

## 🚀 Deployment Steps

1. **Update vercel.json** ✅ (Already done)

2. **Update .env files** (Optional but recommended)
   ```env
   VITE_API_URL=/api
   ```

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Configure Vercel API rewrite"
   git push origin main
   ```

4. **Vercel auto-deploys**
   - Uses new vercel.json
   - API rewrites now active

5. **Verify**
   ```javascript
   // Browser console
   fetch('/api/products')
       .then(r => r.json())
       .then(d => console.log('Success:', d))
   ```

---

## 🎯 Key Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **CORS Issues** | Must configure backend | Mostly handled by Vercel |
| **Same Domain** | No (cross-origin) | Yes (to browser) |
| **Backend URL** | Visible in frontend code | Hidden in vercel.json |
| **Performance** | Good | Better (Vercel edge) |
| **Security** | Standard | Enhanced |
| **Flexibility** | Need to update frontend | Just update vercel.json |

---

## 📝 Updated Documentation

### In DEPLOYMENT_GUIDE.md

Replace:
```
CORS Setup - Backend only
```

With:
```
API Rewriting via Vercel + CORS Setup - Backend
- Vercel rewrites /api requests to backend
- Backend CORS still validates origin
- Best of both worlds
```

### In QUICK_REFERENCE.md

Add:
```
Vercel handles API routing:
/api/* → https://agricart-2toc.onrender.com/api/*
This eliminates most CORS issues!
```

---

## 🔗 Request Path Example

**User searches for products:**

```
1. Browser: GET /api/products
2. Vercel receives request
3. Vercel rewrites to: GET https://agricart-2toc.onrender.com/api/products
4. Backend processes
5. Response sent back
6. Browser sees: 200 OK (same domain!)
7. No CORS error!
```

---

## ⚠️ Important Notes

1. **Backend URL is hardcoded in vercel.json**
   - Update if backend URL changes
   - Redeploy to Vercel after changing

2. **Only /api/* routes are proxied**
   - Other routes return index.html (SPA routing)
   - Perfect for React Router

3. **CORS still important**
   - Vercel rewrite is frontend-side
   - Backend sees original origin
   - Keep CORS configured

4. **Environment variables still useful**
   - For local development
   - For flexibility
   - For testing

---

## 🎊 Summary

Your Agricart deployment is now **even better** with:

✅ Vercel API rewriting (eliminates CORS on frontend)  
✅ SPA routing (all routes work)  
✅ Smart caching (assets cached forever)  
✅ Production ready (no configuration needed)  

---

**Updated:** 2026-02-11  
**Status:** Production Ready with Enhanced Routing
