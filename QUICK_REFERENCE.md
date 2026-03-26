# Agricart - Quick Reference Card

One-page cheat sheet for deployment and troubleshooting.

---

## 🚀 Quick Deployment

```bash
# Commit changes
git add .
git commit -m "Deploy update"
git push origin main

# Vercel auto-deploys when you push to main
# Render auto-deploys when you push to main
# Both start automatically without manual intervention
```

---

## 📝 Environment Variables Checklist

### Frontend (Vercel Dashboard)
```
VITE_API_URL = https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID = your_key
VITE_CLERK_PUBLISHABLE_KEY = your_key
```

### Backend (Render Dashboard)
```
NODE_ENV = production
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/agricart
CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
ASSEMBLYAI_API_KEY = your_key
RAZORPAY_KEY_ID = rzp_test_...
RAZORPAY_KEY_SECRET = key_secret_...
FRONTEND_URL = https://your-app.vercel.app
```

---

## 🔗 Important Links

| Service | URL |
|---------|-----|
| **Frontend Deploy** | https://your-app.vercel.app |
| **Backend API** | https://agricart-2toc.onrender.com |
| **API Endpoint** | https://agricart-2toc.onrender.com/api |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Render Dashboard** | https://dashboard.render.com |
| **MongoDB Atlas** | https://cloud.mongodb.com |
| **Clerk Dashboard** | https://dashboard.clerk.com |
| **Razorpay Dashboard** | https://dashboard.razorpay.com |

---

## 🛠️ Common Commands

```bash
# LOCAL DEVELOPMENT
npm run dev              # Start local development
npm run build           # Build for production
npm run preview         # Preview production build

# TESTING
curl https://backend-url/
curl https://backend-url/api/products
npm run build           # Test build locally

# DEBUGGING
npm install             # Clear cache and reinstall
git status              # Check uncommitted changes
git log                 # View commit history
git push                # Push to trigger deployments
```

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| **Environment var undefined** | Check VITE_ prefix, restart deployment |
| **CORS error** | Update FRONTEND_URL in Render, redeploy |
| **404 on refresh** | Verify vercel.json has rewrites |
| **Blank page** | Check browser console for errors |
| **API 404** | Verify backend URL in env var |
| **Slow to load** | Render free tier cold start (normal) |
| **Cannot connect to DB** | Check MongoDB URI, IP whitelist |
| **Unauthorized (401)** | Check Clerk keys, verify token being sent |

---

## 🔍 Debug Checklist

```javascript
// 1. Check environment
console.log(import.meta.env.VITE_API_URL);

// 2. Test API
fetch(import.meta.env.VITE_API_URL + '/products')
    .then(r => r.json())
    .then(d => console.log(d))

// 3. Check CORS headers
// DevTools → Network → Select API call → Response Headers

// 4. Check backend
curl https://agricart-2toc.onrender.com/

// 5. Check logs
// Vercel: Dashboard → Deployments → Logs
// Render: Dashboard → Service → Logs
```

---

## 📊 Vercel Configuration

**Settings → General:**
- Framework: Vite
- Build: `npm run build`
- Output: `dist`
- Root: `frontend`
- Install: `npm install`

---

## 📊 Render Configuration

**Create Web Service:**
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`
- Environment: Node

---

## 🔑 Environment Variable Names

✅ **CORRECT** (Vite frontend)
```
VITE_API_URL
VITE_RAZORPAY_KEY_ID
VITE_CLERK_PUBLISHABLE_KEY
```

❌ **WRONG** (Won't be exposed)
```
API_URL
REACT_APP_API_URL
PUBLIC_API_URL
```

---

## 🔐 API Request Format

```javascript
// Header with Clerk token (automatic via interceptor)
Authorization: Bearer <token>

// URL format
GET /api/products
POST /api/orders
PUT /api/products/:id
DELETE /api/products/:id
```

---

## 📱 Testing API Endpoints

```bash
# Products
curl https://agricart-2toc.onrender.com/api/products

# Orders (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://agricart-2toc.onrender.com/api/orders/my-orders

# Payments
curl https://agricart-2toc.onrender.com/api/payment/key

# Voice
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"audioData":"base64string"}' \
     https://agricart-2toc.onrender.com/api/voice/speech-to-text
```

---

## 🚀 Deployment Flow

```
Push to GitHub
      ↓
Vercel deploys frontend
      ↓
Render deploys backend
      ↓
Both use environment variables
      ↓
Services communicate via API
      ↓
✅ Deployment complete
```

---

## 📋 Pre-Deployment Checklist

- [ ] All code committed
- [ ] Environment variables set in both dashboards
- [ ] Frontend builds locally: `npm run build`
- [ ] Backend starts locally: `npm run dev`
- [ ] CORS configured (FRONTEND_URL set)
- [ ] API calls tested
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Authentication tested
- [ ] Payment flow tested

---

## 🔗 API Communication

```
Frontend: import.meta.env.VITE_API_URL
   ↓
http://localhost:5000/api (Dev proxy)
   ↓
https://agricart-2toc.onrender.com/api (Production)
   ↓
Backend receives request
   ↓
CORS check + Auth check
   ↓
Database query
   ↓
Response sent back
```

---

## 💾 File Locations

```
frontend/
├── .env                 (Development env)
├── .env.production      (Production env for testing)
├── vite.config.js       (Vite config with proxy)
├── vercel.json          (SPA routing)
└── src/services/api.js  (API service)

backend/
├── .env                 (Production env)
├── server.js            (Express server)
├── routes/              (API routes)
└── models/              (DB schemas)
```

---

## 🎯 Key Configuration Files

**vite.config.js** (Frontend)
- Dev proxy: `/api → http://localhost:5000`
- Handles environment variables

**vercel.json** (Frontend)
- SPA routing (all routes → index.html)
- Cache control headers

**server.js** (Backend)
- CORS for FRONTEND_URL
- Routes and middleware
- MongoDB connection

---

## 📞 Support

| Issue | Resource |
|-------|----------|
| **Deployment help** | Read DEPLOYMENT_GUIDE.md |
| **Setup help** | Read VERCEL_RENDER_SETUP.md |
| **Errors** | Read TROUBLESHOOTING.md |
| **Architecture** | Read ARCHITECTURE_DIAGRAMS.md |
| **Checklist** | Read DEPLOYMENT_CHECKLIST.md |

---

## ⚡ Performance Tips

```bash
# Check bundle size
npm run build
du -sh frontend/dist/

# Should be < 1MB total

# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 🔐 Security Reminders

- ✅ Never commit .env files
- ✅ Use .env in .gitignore
- ✅ VITE_ prefix for frontend only
- ✅ Don't share API keys
- ✅ Keep FRONTEND_URL updated
- ✅ Use HTTPS (automatic on Vercel/Render)

---

## 🆘 Emergency Contacts/Resources

- Vercel Support: https://vercel.com/support
- Render Support: https://render.com/support
- Clerk Docs: https://clerk.com/docs
- Razorpay Docs: https://razorpay.com/docs

---

## 📈 Monitoring

**Vercel:** Dashboard → Analytics
- Monitor uptime, response times, Core Web Vitals

**Render:** Dashboard → Logs
- Monitor backend errors and performance

---

## 🔄 Redeployment

```bash
# Automatic (just push)
git push origin main

# Manual in Vercel
Dashboard → Deployments → ... → Redeploy

# Manual in Render
Dashboard → Service → Scroll → Redeploy
```

---

## 💡 Quick Tips

1. **Env var wrong?** 
   - Check VITE_ prefix (frontend only)
   - Clear browser cache (Ctrl+Shift+Del)
   - Redeploy

2. **API not working?**
   - Check backend URL in env
   - Test: `curl backend-url/api/products`
   - Check CORS in Render logs

3. **Deployment stuck?**
   - Check build logs for errors
   - Verify environment variables
   - Try manual redeploy

4. **Slow loading?**
   - Check Render free tier (cold start)
   - Wait a minute, try again
   - Check network in DevTools

---

**Created:** 2026-02-11  
**Status:** Quick Reference Ready
