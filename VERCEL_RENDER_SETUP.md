# Vercel + Render Deployment Configuration Guide

This document provides step-by-step instructions for configuring your MERN stack for production deployment on Vercel (frontend) and Render (backend).

## Quick Links

- [Vercel Environment Variables Setup](#vercel-environment-variables-setup)
- [Render Environment Variables Setup](#render-environment-variables-setup)
- [Testing & Troubleshooting](#testing--troubleshooting)
- [Final Checklist](#final-checklist)

---

## Vercel Environment Variables Setup

### Step 1: Access Vercel Project Settings

1. Go to **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Select your project (agricart or similar)
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Frontend Environment Variables

Add these variables with their production values:

```
VITE_API_URL → https://agricart-2toc.onrender.com/api

VITE_RAZORPAY_KEY_ID → rzp_test_SEOim7okVIblZC

VITE_CLERK_PUBLISHABLE_KEY → pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
```

**Important:** The `VITE_` prefix is required to expose these to the browser.

### Step 3: Configure Build Settings

In **Settings** → **General**:

| Setting | Value |
|---------|-------|
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Root Directory** | `frontend` |

### Step 4: Verify vercel.json

Ensure your `frontend/vercel.json` contains:

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

### Step 5: Trigger Redeployment

After adding environment variables:

1. Go to **Deployments**
2. Click the three-dot menu on the latest deployment
3. Click **Redeploy**

Or simply push to your repository to trigger automatic redeployment.

---

## Render Environment Variables Setup

### Step 1: Access Render Dashboard

1. Go to **[Render Dashboard](https://dashboard.render.com)**
2. Select your backend service (e.g., "agricart-backend")
3. Go to **Environment** tab
4. Scroll to **Environment Variables** section

### Step 2: Add Backend Environment Variables

Click **Add Environment Variable** and add:

```
KEY                          VALUE
NODE_ENV                     production
PORT                         10000 (or leave for auto assignment)
MONGODB_URI                  mongodb+srv://user:pass@cluster.mongodb.net/agricart
CLERK_PUBLISHABLE_KEY        pk_test_...
CLERK_SECRET_KEY             sk_test_...
ASSEMBLYAI_API_KEY           your_key
RAZORPAY_KEY_ID              rzp_test_...
RAZORPAY_KEY_SECRET          key_secret_...
FRONTEND_URL                 https://your-app.vercel.app
```

### Step 3: Update FRONTEND_URL

The `FRONTEND_URL` is crucial for CORS. Find your Vercel domain:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Copy the domain from the Deployments tab (e.g., `your-app.vercel.app`)
4. Add to Render as: `https://your-app.vercel.app`

### Step 4: Save and Redeploy

1. Click **Save** or **Update** for environment variables
2. Render will automatically redeploy your backend
3. Wait for deployment to complete (check logs)

---

## Testing & Troubleshooting

### Test 1: Verify Backend is Running

```bash
# Replace with your Render backend URL
curl https://agricart-2toc.onrender.com/
```

Expected response:
```json
{"message": "Agricart API is running"}
```

### Test 2: Test API Endpoint

```bash
curl https://agricart-2toc.onrender.com/api/products
```

Expected response:
```json
{"success": true, "count": 0, "data": []}
```

### Test 3: Check CORS Headers

```bash
curl -i -H "Origin: https://your-app.vercel.app" \
   https://agricart-2toc.onrender.com/api/products
```

Look for these response headers:
```
access-control-allow-origin: https://your-app.vercel.app
access-control-allow-credentials: true
```

### Test 4: Verify Frontend Environment Variables

1. Deploy your frontend (push to GitHub)
2. Open the deployed site in browser
3. Open DevTools (F12) → Console tab
4. Run:
   ```javascript
   import.meta.env.VITE_API_URL
   ```
5. Should output your backend URL (not `undefined`)

### Test 5: API Call from Frontend

In browser console:
```javascript
fetch(import.meta.env.VITE_API_URL + '/products')
    .then(r => r.json())
    .then(d => console.log(d))
    .catch(e => console.error(e))
```

### Test 6: Check Vercel Build Logs

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. Click **Build Logs**
4. Look for error messages

Common issues:
- Missing `VITE_` prefix on variables
- Environment variable not set in Vercel
- `npm run build` errors

---

## Common Errors & Solutions

### Error: "Cannot GET /"

**Cause:** vercel.json rewrites not configured

**Solution:** Ensure `vercel.json` has:
```json
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/index.html"}
  ]
}
```

### Error: "Access-Control-Allow-Origin"

**Cause:** Backend CORS not configured for frontend domain

**Solution:**

1. Check `backend/server.js`:
   ```javascript
   app.use(cors({
       origin: process.env.FRONTEND_URL,
       credentials: true
   }));
   ```

2. Ensure `FRONTEND_URL` is set in Render with correct domain

3. Redeploy backend

### Error: "import.meta.env.VITE_API_URL is undefined"

**Cause:** Environment variable not set in Vercel

**Solution:**

1. Go to Vercel Project Settings → Environment Variables
2. Add: `VITE_API_URL = https://agricart-2toc.onrender.com/api`
3. Redeploy (push to GitHub or use Redeploy button)

### Error: 404 on Page Refresh

**Cause:** React Router routes not handled by server

**Solution:** vercel.json rewrites:
```json
{"source": "/(.*)", "destination": "/index.html"}
```

### Error: Products Not Loading

**Cause:** Multiple possible - verify systematically

1. **Check API URL:**
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   // Should show: https://agricart-2toc.onrender.com/api
   ```

2. **Check backend is running:**
   ```bash
   curl https://agricart-2toc.onrender.com/api/products
   ```

3. **Check CORS headers** (see Test 3 above)

4. **Check Render backend logs:**
   - Render Dashboard → Your Service → Logs
   - Look for errors

5. **Check Vercel frontend logs:**
   - Browser DevTools → Console
   - Look for error messages

---

## Final Checklist

Before considering deployment complete:

### Backend (Render)

- [ ] Backend URL is accessible: `https://agricart-2toc.onrender.com/`
- [ ] API endpoint works: `https://agricart-2toc.onrender.com/api/products`
- [ ] CORS headers include your Vercel domain
- [ ] MongoDB connection working (check Render logs)
- [ ] All environment variables set in Render
- [ ] `FRONTEND_URL` matches your Vercel domain exactly

### Frontend (Vercel)

- [ ] Build succeeds (no errors in Build Logs)
- [ ] Site loads without 404 errors
- [ ] Navigation works (page refresh doesn't break routing)
- [ ] All `VITE_*` variables are in Vercel settings
- [ ] `vercel.json` has SPA routing rewrites
- [ ] Environment variables accessible in browser

### Integration

- [ ] API calls from frontend reach backend
- [ ] CORS errors resolved
- [ ] Data displays correctly from API
- [ ] No "Network Error" messages in console
- [ ] Authentication works (if using Clerk)

---

## Advanced: Custom Domain Setup

### For Vercel Frontend

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Update DNS records (follow Vercel instructions)
4. Update `FRONTEND_URL` in Render if needed

### For Render Backend

1. Go to Render Service → Settings → Custom Domains
2. Add your custom domain (if needed)
3. Update DNS records
4. Update `VITE_API_URL` in Vercel if needed

---

## Performance Tips

### 1. Enable Caching

Already configured in `vercel.json`:
- Static assets: Cache forever
- HTML: Always revalidate

### 2. Optimize Images

Before deploying, compress images:
```bash
# Using ImageOptim (Mac) or online tools
# Recommended: use CDN for images
```

### 3. Monitor Performance

Use Vercel Analytics:
- Vercel Dashboard → Project → Analytics
- Check Core Web Vitals

### 4. Check Build Size

```bash
npm run build
# Check dist/ folder size (should be < 200KB gzipped)
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs/deployment
- **Render Docs:** https://render.com/docs/deploy-node-express-app
- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html
- **CORS Explained:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

**Last Updated:** 2026-02-11  
**Status:** Ready for Production
