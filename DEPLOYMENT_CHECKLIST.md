# Deployment Checklist - Agricart

Complete step-by-step checklist for deploying Agricart to production.

---

## Pre-Deployment Checklist

### Frontend Code Quality
- [ ] No console.log statements in production code
- [ ] No hardcoded API URLs
- [ ] All API calls use `import.meta.env.VITE_API_URL`
- [ ] Error handling implemented for all API calls
- [ ] Loading states added to all async operations
- [ ] Mobile responsive design verified
- [ ] All images optimized (< 500KB)
- [ ] No unused dependencies in package.json

### Backend Code Quality
- [ ] No console.log statements (except errors)
- [ ] All environment variables used, none hardcoded
- [ ] CORS configured for production domain
- [ ] Error handling middleware implemented
- [ ] Input validation on all endpoints
- [ ] No security vulnerabilities
- [ ] Database indexes created for frequently queried fields
- [ ] No unused dependencies in package.json

### Database
- [ ] MongoDB Atlas account created
- [ ] Database and collections created
- [ ] Database user created with strong password
- [ ] IP whitelist includes Render IP (0.0.0.0/0)
- [ ] Backup enabled
- [ ] Connection string verified

### External Services
- [ ] Clerk application created and configured
- [ ] Clerk publishable and secret keys obtained
- [ ] Razorpay account created
- [ ] Razorpay test keys obtained
- [ ] AssemblyAI API key obtained
- [ ] All API keys stored securely (never in code)

---

## Environment Variables Configuration

### Frontend - Vercel Dashboard Setup

**Step 1:** Go to [Vercel Dashboard](https://vercel.com/dashboard)

**Step 2:** Select your project

**Step 3:** Go to Settings → Environment Variables

**Step 4:** Add these variables:

```
Name: VITE_API_URL
Value: https://agricart-2toc.onrender.com/api
Environments: Production, Preview, Development
```

```
Name: VITE_RAZORPAY_KEY_ID
Value: rzp_test_SEOim7okVIblZC
Environments: Production, Preview, Development
```

```
Name: VITE_CLERK_PUBLISHABLE_KEY
Value: pk_test_Y29tbXVuYWwtbWFydGluLTEwLmNsZXJrLmFjY291bnRzLmRldiQ
Environments: Production, Preview, Development
```

**Step 5:** Click Save

### Backend - Render Dashboard Setup

**Step 1:** Go to [Render Dashboard](https://dashboard.render.com)

**Step 2:** Select your service (agricart-backend)

**Step 3:** Go to Environment

**Step 4:** Add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agricart
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ASSEMBLYAI_API_KEY=your_api_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=key_secret_...
FRONTEND_URL=https://your-app.vercel.app
```

**Step 5:** Click Save (automatically triggers redeploy)

---

## Deployment Steps

### Step 1: Deploy Backend to Render

**Via Git (Recommended):**
1. Commit all changes: `git add . && git commit -m "Deploy"`
2. Push to GitHub: `git push origin main`
3. Render automatically deploys on push
4. Wait for deployment to complete (check logs)
5. Verify health: `curl https://agricart-2toc.onrender.com/`

**Or Manual Redeploy:**
1. Go to Render Dashboard
2. Select your service
3. Click three-dot menu → "Redeploy"
4. Wait for completion

### Step 2: Deploy Frontend to Vercel

**Via Git (Recommended):**
1. Commit all changes: `git add . && git commit -m "Deploy"`
2. Push to GitHub: `git push origin main`
3. Vercel automatically deploys on push
4. Wait for deployment to complete (check logs)
5. Verify build succeeded

**Or Manual Redeploy:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments
4. Click three-dot menu on latest → "Redeploy"
5. Wait for completion

### Step 3: Verify Deployment

```bash
# Test backend health
curl https://agricart-2toc.onrender.com/
# Expected: {"message": "Agricart API is running"}

# Test backend API
curl https://agricart-2toc.onrender.com/api/products
# Expected: {"success": true, "count": X, "data": [...]}

# Test frontend loads
curl https://your-app.vercel.app
# Should return HTML (status 200)
```

### Step 4: Post-Deployment Testing

Open https://your-app.vercel.app in browser:

- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] Page refresh doesn't show 404
- [ ] Browser console has no errors
- [ ] API calls succeed (check Network tab)
- [ ] Product list loads
- [ ] Clerk login works
- [ ] Role-based redirection works (Farmer vs Consumer)
- [ ] Add to cart works
- [ ] Search works
- [ ] Voice search works
- [ ] Payment flow works
- [ ] Order history displays

---

## Rollback Procedure

If something goes wrong, you can quickly rollback:

### Rollback Frontend (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click it, then click "Promote to Production"
4. Vercel reverts to previous version

### Rollback Backend (Render)

1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Find the previous working deployment
4. Click the commit hash
5. Click "Redeploy at this commit"

---

## Monitoring & Verification

### Monitor Frontend (Vercel)

```
Dashboard → Select Project → Analytics
- Check response time
- Check uptime
- Check Core Web Vitals
```

### Monitor Backend (Render)

```
Dashboard → Select Service → Logs
- Watch for error messages
- Check memory usage
- Check response times
```

### Test API Connectivity

```javascript
// In browser console at https://your-app.vercel.app
fetch(import.meta.env.VITE_API_URL + '/products')
    .then(r => r.json())
    .then(d => console.log('Success:', d))
    .catch(e => console.error('Error:', e))
```

### Check Environment Variables

```javascript
// In browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log('Clerk Key:', import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
```

---

## Common Deployment Issues

### Issue: "Environment variables not set"

**Solution:**
1. Verify variables in Vercel/Render dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Clear browser cache (Ctrl+Shift+Del)

### Issue: "CORS error" after deployment

**Solution:**
1. Check FRONTEND_URL is set correctly in Render
2. Should be your Vercel domain: `https://your-app.vercel.app`
3. Redeploy backend
4. Verify CORS headers: `curl -i -H "Origin: https://your-app.vercel.app" https://backend-url/api/products`

### Issue: "Products not loading"

**Solution:**
1. Verify backend is running: `curl https://backend-url/`
2. Check API URL in browser console: `console.log(import.meta.env.VITE_API_URL)`
3. Test API directly: `curl https://backend-url/api/products`
4. Check browser Network tab for errors
5. Check Render backend logs for errors

### Issue: "404 on page refresh"

**Solution:**
1. Verify `vercel.json` has rewrite rules
2. Restart deployment in Vercel
3. Clear browser cache

---

## Performance Optimization

### Frontend Optimization

- ✅ Images compressed and optimized
- ✅ Code splitting implemented
- ✅ Lazy loading for routes
- ✅ CSS minified via Tailwind
- ✅ JavaScript minified via Vite
- ✅ Unused dependencies removed

**Check bundle size:**
```bash
cd frontend
npm run build
# Check dist/ folder size
du -sh dist/
# Should be < 1MB total
```

### Backend Optimization

- ✅ Database indexes created
- ✅ Query optimization done
- ✅ Pagination implemented
- ✅ Caching configured

**Check Render memory usage:**
- Render Dashboard → Your Service → Metrics
- Monitor CPU, memory, network

---

## Security Verification

- [ ] No hardcoded secrets in code
- [ ] All environment variables are private
- [ ] HTTPS enforced (default on Vercel/Render)
- [ ] CORS configured for frontend only
- [ ] Database user has limited permissions
- [ ] MongoDB IP whitelist configured
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication middleware working

---

## Documentation & Support

### For Users
- [ ] User guide created
- [ ] Video tutorials recorded
- [ ] FAQ documented
- [ ] Contact info provided

### For Developers
- [ ] API documentation complete
- [ ] Code comments added
- [ ] README updated
- [ ] Contributing guidelines created
- [ ] Deployment guide created

### Support Channels
- [ ] GitHub Issues enabled
- [ ] Email support setup
- [ ] Documentation hosted

---

## Post-Deployment Checklist

- [ ] Analytics/monitoring setup complete
- [ ] Backup procedure documented
- [ ] Disaster recovery plan created
- [ ] Scaling plan identified
- [ ] Cost monitoring configured
- [ ] SSL certificates verified (auto on Vercel/Render)
- [ ] Firewall rules configured (if applicable)
- [ ] Auto-scaling enabled (if needed)

---

## Future Improvements

- [ ] Add custom domain
- [ ] Setup CI/CD pipeline (already done via Git)
- [ ] Add automated tests
- [ ] Setup logging/error tracking (e.g., Sentry)
- [ ] Add API rate limiting
- [ ] Setup CDN for static assets
- [ ] Add caching layer (Redis)
- [ ] Setup database replication
- [ ] Add email notifications
- [ ] Implement analytics

---

## Sign-Off

- **Deployed By:** _______________
- **Date:** _______________
- **Verified By:** _______________
- **Date:** _______________

---

## Quick Reference

### Deployment URLs
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://agricart-2toc.onrender.com
- **API Base:** https://agricart-2toc.onrender.com/api

### Dashboard Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Razorpay Dashboard:** https://dashboard.razorpay.com

### Useful Commands

```bash
# View Render logs
render logs

# View Vercel logs
vercel logs

# Redeploy
git push origin main

# Test backend
curl https://agricart-2toc.onrender.com/

# Test API
curl https://agricart-2toc.onrender.com/api/products
```

---

**Last Updated:** 2026-02-11  
**Status:** Ready for Production Deployment
