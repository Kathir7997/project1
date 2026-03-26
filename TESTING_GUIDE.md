# Agricart Testing & Troubleshooting Guide

## Current Test Status

### ✅ Successfully Completed
- Backend dependencies installed
- Frontend dependencies installed  
- Environment files created (`.env`)
- Frontend dev server running on `http://localhost:5173/`

### ⚠️ Issues Found

**Frontend:**
- **Blank Screen**: The application shows a blank page
- **Root Cause**: Missing or invalid Clerk API keys in `.env` file
- **Error**: ClerkProviderBase component failing to initialize

**Backend:**
- MongoDB connection error (expected - requires MongoDB setup)
- Clerk configuration error (expected - requires API keys)

---

## Required Setup Steps

### 1. Get Clerk API Keys

1. Visit [Clerk.com](https://clerk.com/) and create a free account
2. Create a new application
3. Go to **API Keys** section
4. Copy **Publishable Key** (starts with `pk_test_`)
5. Copy **Secret Key** (starts with `sk_test_`)

**Update Backend `.env`:**
```env
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

**Update Frontend `.env`:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
# Connection string: mongodb://localhost:27017/agricart
```

**Option B: MongoDB Atlas (Recommended)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agricart
```

### 3. Configure Role Selection in Clerk

**Important:** For role-based authentication to work:

1. In Clerk Dashboard → **User & Authentication** → **Metadata**
2. Add custom metadata field: `role`
3. Allow users to set role during signup (Farmer or Consumer)

OR manually set user roles after signup:
1. Navigate to **Users** in Clerk Dashboard
2. Select a user
3. Under **Public Metadata**, add:
```json
{
  "role": "Farmer"
}
```
or
```json
{
  "role": "Consumer"
}
```

### 4. Get Razorpay Test Keys (Optional for Payment Testing)

1. Visit [Razorpay](https://razorpay.com/)
2. Create account
3. Go to **Settings** → **API Keys**
4. Generate Test Keys
5. Update both `.env` files:

**Backend:**
```env
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret
```

**Frontend:**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

### 5. Get AssemblyAI Key (Optional for Voice Search)

1. Visit [AssemblyAI](https://www.assemblyai.com/)
2. Create free account
3. Copy API key from dashboard
4. Update `backend/.env`:
```env
ASSEMBLYAI_API_KEY=your_assemblyai_key
```

---

## Restart Servers After Configuration

After adding the API keys to your `.env` files:

1. **Stop both servers** (Ctrl+C in terminals)

2. **Restart Backend:**
```bash
cd d:/project/farmcart/backend
npm run dev
```

3. **Restart Frontend:**
```bash
cd d:/project/farmcart/frontend
npm run dev
```

4. **Open Browser:**
Navigate to `http://localhost:5173/`

---

## Expected Behavior After Setup

### Landing Page
- Should show hero section with "Fresh from Farm to Your Home"
- Category cards (Vegetables, Fruits, Grains, etc.)
- Sign Up / Sign In buttons in header

### After Sign Up (Farmer Role)
- Redirected to Farmer Dashboard
- Shows stats cards (Products, Sales, Revenue)
- Can add products
- Can view orders

### After Sign Up (Consumer Role)
- Redirected to Consumer Homepage
- Can browse products
- Can search with voice (microphone icon)
- Can add to cart/wishlist
- Can checkout (needs Razorpay keys)

---

## Test Razorpay Payments

Use Razorpay test cards:

**Test Credit Card:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

---

## Common Errors & Solutions

### Error: "Clerk publishable key is missing"
**Solution:** Add valid Clerk publishable key to frontend `.env` file

### Error: "MongoServerError: connect ECONNREFUSED"
**Solution:** 
- Ensure MongoDB is running (local or Atlas)
- Verify connection string in backend `.env`
- For Atlas, whitelist your IP address

### Error: "Cannot find module"
**Solution:** Run `npm install` in the affected directory

### Blank Screen / White Page
**Solution:** 
1. Check browser console for errors (F12)
2. Verify Clerk keys are correct
3. Restart frontend dev server
4. Clear browser cache

### Port Already in Use
**Solution:**
```bash
# Kill process on port 5000 (backend)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change port in backend/.env
PORT=5001
```

### Voice Search Not Working
**Solution:**
1. Allow microphone permissions in browser
2. Use HTTPS in production (MediaRecorder API requires it)
3. Verify AssemblyAI key in backend `.env`

---

## Minimum Configuration for Testing UI

If you just want to see the UI without full functionality:

**Backend `.env` (Minimum):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agricart
CLERK_PUBLISHABLE_KEY=pk_test_[get_from_clerk]
CLERK_SECRET_KEY=sk_test_[get_from_clerk]
```

**Frontend `.env` (Minimum):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_[get_from_clerk]
VITE_API_URL=http://localhost:5000
```

**Note:** **Clerk keys are mandatory** for the app to load. MongoDB, Razorpay, and AssemblyAI can be configured later.

---

## Next Steps

1. ✅ Get Clerk API keys (mandatory)
2. ✅ Set up MongoDB (mandatory)
3. ⏺️ Configure Razorpay (optional - for payment testing)
4. ⏺️ Configure AssemblyAI (optional - for voice search)
5. ✅ Restart servers
6. ✅ Test user flows

---

## Current Server Status

**Frontend:** ✅ Running on `http://localhost:5173/`
**Backend:** ⚠️ Needs Clerk keys and MongoDB connection

**Screenshot of Current State:**

![Blank Screen - Waiting for Clerk Configuration](file:///C:/Users/kathi/.gemini/antigravity/brain/2fd5a718-1998-4955-92d5-63bdc399db4c/agricart_landing_page_blank_1770789976166.png)

*The application loads but shows a blank screen due to missing Clerk API keys. Once configured, the full Agricart interface will render.*

---

**Ready to proceed once API keys are configured!** 🌾
