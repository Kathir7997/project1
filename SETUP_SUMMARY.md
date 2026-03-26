# Agricart Deployment - Complete Setup Summary

This document provides a complete overview of your Agricart MERN application deployment on Vercel (Frontend) and Render (Backend).

---

## 🎯 Quick Start

### For Developers
1. Clone repository
2. Install dependencies in `frontend/` and `backend/`
3. Copy `.env.example` files to `.env`
4. Update environment variables with your API keys
5. Run `npm run dev` in both folders
6. Access frontend at http://localhost:5173

### For Deployment
1. Push code to GitHub
2. Vercel automatically deploys frontend
3. Render automatically deploys backend
4. Update environment variables in both dashboards
5. Verify everything works

---

## 📋 Configuration Files

### Frontend Configuration

**vite.config.js**
- Configures Vite build tool
- Enables development proxy for /api requests
- Handles environment variables

**vercel.json**
- SPA routing configuration (handles React Router)
- Cache control for assets
- Rewrite rules for 404 handling

**.env** (Development)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=test_key
VITE_CLERK_PUBLISHABLE_KEY=test_key
```

**.env.production** (Production testing)
```env
VITE_API_URL=https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID=test_key
VITE_CLERK_PUBLISHABLE_KEY=test_key
```

### Backend Configuration

**.env** (Production in Render)
```env
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ASSEMBLYAI_API_KEY=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=key_secret_...
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔑 Environment Variables Explained

### VITE_ Prefix (Frontend Only)

In Vite/Webpack based apps, variables must start with `VITE_` to be exposed to browser.

```javascript
// ✅ Correct - accessible
import.meta.env.VITE_API_URL

// ❌ Wrong - not accessible
import.meta.env.API_URL
```

### Vercel Environment Variables

Set in: **Vercel Dashboard → Project Settings → Environment Variables**

```
VITE_API_URL → Your backend URL
VITE_RAZORPAY_KEY_ID → Razorpay key
VITE_CLERK_PUBLISHABLE_KEY → Clerk key
```

### Render Environment Variables

Set in: **Render Dashboard → Your Service → Environment**

```
NODE_ENV → "production"
MONGODB_URI → MongoDB connection string
CLERK_PUBLISHABLE_KEY → Same as frontend
CLERK_SECRET_KEY → Clerk secret key
ASSEMBLYAI_API_KEY → AssemblyAI API key
RAZORPAY_KEY_ID → Razorpay key
RAZORPAY_KEY_SECRET → Razorpay secret
FRONTEND_URL → Your Vercel domain
```

---

## 🌐 API Communication Flow

### Development (Local)

```
Frontend (http://localhost:5173)
    ↓
Vite Proxy (/api → http://localhost:5000)
    ↓
Backend (http://localhost:5000)
    ↓
MongoDB (local connection string)
```

### Production (Deployed)

```
Frontend (https://your-app.vercel.app)
    ↓
import.meta.env.VITE_API_URL (https://agricart-2toc.onrender.com/api)
    ↓
Backend (https://agricart-2toc.onrender.com)
    ↓
MongoDB Atlas (connection string with credentials)
```

### Code Example

```javascript
// frontend/src/services/api.js
import axios from 'axios';

// Automatically uses correct URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(config => {
    const token = window.Clerk?.session?.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

---

## 📦 Deployment Architecture

```
GitHub Repository
    ↓
    ├─→ Vercel (Frontend)
    │   ├─ Clones frontend/ folder
    │   ├─ Runs: npm install && npm run build
    │   ├─ Output: dist/ folder
    │   └─ Serves at: https://your-app.vercel.app
    │
    └─→ Render (Backend)
        ├─ Clones backend/ folder
        ├─ Runs: npm install && npm start
        ├─ Connects to: MongoDB Atlas
        └─ Serves at: https://agricart-2toc.onrender.com
```

---

## 🔧 Common Configuration Tasks

### Task 1: Change Backend URL

**When:** Backend moves to different Render URL

**Steps:**
1. Get new backend URL from Render Dashboard
2. Update in Vercel Dashboard → Environment Variables
3. Set `VITE_API_URL = new_url`
4. Redeploy Vercel (push to GitHub or manual)

### Task 2: Update API Keys

**When:** Rotating Razorpay or Clerk keys

**Steps for Frontend:**
1. Update in Vercel → Environment Variables
2. Redeploy Vercel

**Steps for Backend:**
1. Update in Render → Environment Variables
2. Render auto-redeploys

### Task 3: Test CORS Configuration

```bash
# Check if backend allows frontend domain
curl -i -H "Origin: https://your-app.vercel.app" \
   https://agricart-2toc.onrender.com/api/products

# Look for these headers in response:
# access-control-allow-origin: https://your-app.vercel.app
# access-control-allow-credentials: true
```

### Task 4: Debug Environment Variables

**Frontend:**
```javascript
// Browser console
console.log(import.meta.env);
console.log(import.meta.env.VITE_API_URL);
```

**Backend:**
```javascript
// server.js
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
```

---

## 🐛 Troubleshooting Matrix

| Issue | Frontend | Backend | CORS | Env Var |
|-------|----------|---------|------|---------|
| 404 on refresh | ❌ vercel.json | | | |
| Blank page | ❌ Check console | | | |
| API not reaching | | ❌ Not running | ❌ | ❌ |
| CORS error | | | ❌ FRONTEND_URL | |
| Env var undefined | | | | ❌ Missing VITE_ prefix |
| Slow to load | Optimization needed | Cold start | | |
| 500 errors | | ❌ Check logs | | ❌ Missing keys |

---

## 📊 Performance Monitoring

### Vercel Analytics
- **URL:** Dashboard → Project → Analytics
- **Monitor:** Response time, uptime, Core Web Vitals

### Render Logs
- **URL:** Dashboard → Service → Logs
- **Monitor:** Error messages, memory usage, response times

### API Performance
```javascript
// Measure API response time
const start = Date.now();
const response = await api.get('/products');
console.log(`Response time: ${Date.now() - start}ms`);
```

---

## 🔐 Security Checklist

- ✅ No hardcoded API keys in code
- ✅ All secrets in environment variables
- ✅ HTTPS enforced (automatic on Vercel/Render)
- ✅ CORS limited to specific domain
- ✅ MongoDB requires authentication
- ✅ Clerk authentication enforced
- ✅ Razorpay verification on backend
- ✅ Input validation on all endpoints

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Project overview, setup instructions |
| **DEPLOYMENT_GUIDE.md** | Complete deployment guide with examples |
| **VERCEL_RENDER_SETUP.md** | Step-by-step Vercel & Render setup |
| **TROUBLESHOOTING.md** | Common issues and detailed solutions |
| **DEPLOYMENT_CHECKLIST.md** | Pre-deployment and post-deployment checklists |
| **vite.config.js** | Vite configuration with detailed comments |
| **vercel.json** | Vercel deployment rules with SPA routing |

---

## 🚀 Step-by-Step Deployment

### First Time Deployment

**1. Prepare Code**
```bash
# Verify everything works locally
cd frontend && npm run build
cd backend && npm run build (no build step, just verify it runs)
```

**2. Create Vercel Project**
- https://vercel.com/dashboard
- Add repository
- Set Root Directory: `frontend`
- Add VITE_* environment variables
- Deploy

**3. Create Render Service**
- https://dashboard.render.com
- New Web Service
- Set Build: `cd backend && npm install`
- Set Start: `cd backend && npm start`
- Add all environment variables
- Deploy

**4. Update Vercel Environment**
- Get Render backend URL
- Add `VITE_API_URL = render_url`
- Redeploy Vercel

**5. Verify Deployment**
- Test https://your-app.vercel.app
- Test https://render-url/api/products
- Check browser console for errors

### Subsequent Deployments

Just push to GitHub:
```bash
git add .
git commit -m "Update: description"
git push origin main
```

Vercel and Render automatically deploy.

---

## 💡 Pro Tips

### Tip 1: Use Different Environments

Create `.env.local` for local overrides:
```env
# Won't be committed, used for local testing
VITE_API_URL=http://localhost:5000/api
```

### Tip 2: Monitor Logs

```bash
# Real-time Vercel logs
vercel logs --follow

# Render logs in dashboard
# Service → Logs → Auto-refresh
```

### Tip 3: Quick Rollback

If deployment breaks:
1. Revert last commit: `git revert HEAD`
2. Push: `git push origin main`
3. Vercel/Render auto-deploy previous version

### Tip 4: Test Before Committing

```bash
# Test build locally
npm run build

# Test locally with production env
npm run build
npm run preview

# This ensures no build errors in production
```

### Tip 5: Optimize Bundle Size

```bash
# Check what's in your bundle
npm install -D webpack-bundle-analyzer

# View in Vite
npm run build -- --stats
```

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/deployments/overview
- **Render Docs:** https://render.com/docs/deploy-nodejs-express-app
- **Vite Docs:** https://vitejs.dev/guide/
- **React Docs:** https://react.dev
- **MongoDB Docs:** https://docs.mongodb.com
- **Clerk Docs:** https://clerk.com/docs
- **Razorpay Docs:** https://razorpay.com/docs/
- **AssemblyAI Docs:** https://www.assemblyai.com/docs

---

## ✅ Final Checklist Before Going Live

- [ ] All code committed to main branch
- [ ] Environment variables set in both dashboards
- [ ] Frontend builds locally without errors
- [ ] Backend starts locally and connects to MongoDB
- [ ] CORS configured correctly
- [ ] API endpoints tested from frontend
- [ ] Authentication working (Clerk)
- [ ] Payment flow tested (Razorpay)
- [ ] Voice search tested (AssemblyAI)
- [ ] Mobile responsive verified
- [ ] All redirects working (404 refresh test)
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Notifications (toast) working
- [ ] No console errors
- [ ] Performance acceptable (< 3s page load)
- [ ] Deployment logs checked
- [ ] Monitoring setup complete

---

## 📝 Notes

- Backend URL may change, save it for reference
- Never commit `.env` files
- Use `.env.example` as template
- Keep API keys secure
- Test after every deployment
- Monitor logs regularly

---

**Created:** 2026-02-11  
**Status:** Production Ready  
**Version:** 1.0.0
