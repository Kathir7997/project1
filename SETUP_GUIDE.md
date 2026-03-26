# Agricart Setup Guide

Complete step-by-step instructions to set up and run the Agricart platform locally.

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Local installation or Atlas account 
- **Git** - For cloning the repository
- **Code Editor** - VS Code recommended

## Required Third-Party Accounts

### 1. MongoDB
**Option A: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/agricart`

**Option B: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/agricart`

### 2. Clerk (Authentication)
1. Go to [Clerk](https://clerk.com/)
2. Sign up for a free account
3. Create a new application
4. Navigate to **API Keys**
5. Copy:
   - Publishable Key (`pk_test_...`)
   - Secret Key (`sk_test_...`)
6. Go to **User & Authentication** → **Metadata**
7. Add custom public metadata field: `role` (for Farmer/Consumer)

**Important:** Configure role selection during signup:
- In Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**
- Enable custom fields to allow role selection

### 3. Razorpay (Payments)
1. Go to [Razorpay](https://razorpay.com/)
2. Sign up and create an account
3. Navigate to **Settings** → **API Keys**
4. Generate test keys:
   - Key ID (`rzp_test_...`)
   - Key Secret
5. **Important:** Use test mode for development

### 4. AssemblyAI (Voice Recognition)
1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for a free account
3. Navigate to **Dashboard**
4. Copy your API Key

---

## Installation Steps

### Step 1: Navigate to Project Directory
```bash
cd d:/project/farmcart
```

### Step 2: Backend Setup

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
copy .env.example .env
```

4. **Configure .env file**

Open `backend/.env` and add your credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_secret

# AssemblyAI
ASSEMBLYAI_API_KEY=your_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. **Start backend server**
```bash
npm run dev
```

✅ Backend should be running on `http://localhost:5000`

---

### Step 3: Frontend Setup

1. **Open new terminal and navigate to frontend**
```bash
cd d:/project/farmcart/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
copy .env.example .env
```

4. **Configure .env file**

Open `frontend/.env` and add:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key

# Backend API
VITE_API_URL=http://localhost:5000

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_your_key
```

5. **Start frontend development server**
```bash
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

---

## Testing the Application

### 1. Create Farmer Account
1. Open `http://localhost:5173`
2. Click **Sign Up**
3. Register with:
   - Email
   - Password
   - **Set role metadata to "Farmer"** (in Clerk during signup)
4. After login, you'll be redirected to Farmer Dashboard

### 2. Add Products as Farmer
1. Go to **Manage Products**
2. Click **Add New Product**
3. Fill in:
   - Product name
   - Description
   - Price
   - Category
   - Stock
   - Image URLs (comma-separated)
4. Click **Add Product**

### 3. Create Consumer Account
1. Sign out from Farmer account
2. Create new account with role "Consumer"
3. Browse products
4. Test voice search (click microphone icon)
5. Add products to cart
6. Complete checkout

### 4. Testing Voice Search
1. Click the microphone icon in search bar
2. Allow microphone access
3. Speak product name (e.g., "tomatoes")
4. Stop recording
5. Search should populate with transcribed text

### 5. Testing Payment
**Note:** Use Razorpay test mode

Test Card Details:
- **Card Number:** `4111 1111 1111 1111`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
**Solution:** 
- Check MongoDB is running
- Verify connection string in `.env`
- For Atlas, whitelist your IP address

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in `.env` to different number (e.g., 5001)
- Or kill process using port 5000

### Frontend Issues

**Clerk Error: Missing Publishable Key**
```
Error: Missing Clerk Publishable Key
```
**Solution:**
- Verify `VITE_CLERK_PUBLISHABLE_KEY` in `frontend/.env`
- Restart dev server after changing `.env`

**API Not Responding**
```
Network Error / CORS Error
```
**Solution:**
- Ensure backend is running
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is enabled in backend

### Voice Search Issues

**Microphone Access Denied**
**Solution:**
- Allow microphone permissions in browser
- Use HTTPS in production (required for getUserMedia)

**Transcription Fails**
**Solution:**
- Verify `ASSEMBLYAI_API_KEY` is correct
- Check audio format is supported (webm, mp3, wav)
- Ensure sufficient API credits

---

## Production Deployment

### Environment Variables
Update `.env` files for production:
- Change `NODE_ENV=production`
- Use production database
- Use production Clerk keys
- Use production Razorpay keys (live mode)

### Build Frontend
```bash
cd frontend
npm run build
```

### Security Checklist
- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable rate limiting
- [ ] Implement request validation
- [ ] Set up monitoring and logging

---

## Additional Configuration

### Clerk Role-Based Authentication

To enable role selection during signup:

1. Go to Clerk Dashboard
2. Navigate to **Customization** → **Sessions**
3. Add custom session claims to include role
4. In **User & Authentication** → **Sign Up**
5. Add custom field for role selection

### Razorpay Webhooks (Optional)

For production, set up webhooks:
1. Razorpay Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Enable payment events
4. Add webhook secret to `.env`

---

## Support

For issues specific to third-party services:
- **Clerk:** [Clerk Documentation](https://clerk.com/docs)
- **Razorpay:** [Razorpay Docs](https://razorpay.com/docs/)
- **AssemblyAI:** [AssemblyAI Docs](https://www.assemblyai.com/docs)
- **MongoDB:** [MongoDB Docs](https://www.mongodb.com/docs/)

---

**You're all set! Happy farming! 🌾**
