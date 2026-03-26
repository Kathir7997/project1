# Agricart - MERN Stack E-Commerce Platform

A full-stack e-commerce application for buying and selling agricultural products, with role-based authentication, voice search, and payment integration.

**Live Demo:**
- Frontend: https://your-app.vercel.app
- Backend API: https://agricart-2toc.onrender.com/api

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Running Locally](#running-locally)
7. [Deployment](#deployment)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
agricart/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services & utilities
│   │   ├── context/            # Context API state
│   │   ├── hooks/              # Custom hooks
│   │   ├── routes/             # Route definitions
│   │   └── index.css           # Global styles (Tailwind)
│   ├── vite.config.js          # Vite configuration
│   ├── vercel.json             # Vercel deployment config
│   ├── .env                    # Development env variables
│   └── .env.production         # Production env variables
│
├── backend/                     # Node.js + Express backend
│   ├── models/                 # MongoDB schemas
│   ├── controllers/            # Route controllers
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── config/                 # Configuration files
│   ├── server.js               # Express app entry point
│   ├── .env                    # Backend env variables
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md         # Complete deployment guide
├── VERCEL_RENDER_SETUP.md      # Vercel & Render setup
├── TROUBLESHOOTING.md          # Troubleshooting guide
└── README.md                   # This file
```

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **Clerk** - Authentication
- **Razorpay** - Payment gateway
- **React Hot Toast** - Notifications
- **Recharts** - Analytics charts

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Clerk SDK** - Authentication
- **Razorpay SDK** - Payment processing
- **AssemblyAI SDK** - Speech-to-text
- **CORS** - Cross-origin resource sharing
- **Multer** - File uploads (optional)

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting

---

## Features

### 🚀 Core Features

#### Authentication & Authorization
- ✅ Role-based login (Farmer & Consumer)
- ✅ Clerk authentication integration
- ✅ Protected routes based on role
- ✅ Automatic role-based redirection

#### Consumer Features
- ✅ Browse products with filters
- ✅ Search products (text & voice)
- ✅ Add to cart & wishlist
- ✅ Place orders
- ✅ Razorpay payment integration
- ✅ Order history tracking
- ✅ Profile management

#### Farmer Features
- ✅ Add/edit/delete products
- ✅ Manage inventory
- ✅ View sales orders
- ✅ Revenue analytics
- ✅ Sales dashboard

#### Technical Features
- ✅ Voice search using AssemblyAI
- ✅ Real-time payment verification
- ✅ Responsive design (mobile-first)
- ✅ Error handling & validation
- ✅ Loading states & notifications
- ✅ API interceptors for auth tokens

---

## Installation & Setup

### Prerequisites

- Node.js >= 18.0
- npm or yarn
- Git
- MongoDB Atlas account
- Clerk account
- Razorpay account
- AssemblyAI API key

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/agricart.git
cd agricart
```

### Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file for development
cp .env.example .env

# Edit .env with your local values
```

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
```

### Step 4: Configure Environment Variables

See [Environment Variables](#environment-variables) section below.

---

## Environment Variables

### Frontend Variables

**frontend/.env** (Development):
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_test_key
```

**frontend/.env.production** (Production - for local testing):
```env
VITE_API_URL=https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

**In Vercel Dashboard - Settings → Environment Variables:**
```
VITE_API_URL = https://agricart-2toc.onrender.com/api
VITE_RAZORPAY_KEY_ID = your_razorpay_key
VITE_CLERK_PUBLISHABLE_KEY = your_clerk_key
```

### Backend Variables

**backend/.env**:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agricart

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AssemblyAI
ASSEMBLYAI_API_KEY=your_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=key_secret_...

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**In Render Dashboard - Environment Variables:**
```
PORT = 10000
NODE_ENV = production
MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/agricart
CLERK_PUBLISHABLE_KEY = pk_test_...
CLERK_SECRET_KEY = sk_test_...
ASSEMBLYAI_API_KEY = your_key
RAZORPAY_KEY_ID = rzp_test_...
RAZORPAY_KEY_SECRET = key_secret_...
FRONTEND_URL = https://your-app.vercel.app
```

### Getting API Keys

**Clerk:**
1. Go to https://dashboard.clerk.com
2. Create application
3. Copy "Publishable Key" and "Secret Key"

**Razorpay:**
1. Go to https://dashboard.razorpay.com
2. Navigate to Settings → API Keys
3. Copy "Key ID" and "Key Secret"

**AssemblyAI:**
1. Go to https://www.assemblyai.com
2. Sign up for API key
3. Copy your API key

**MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Get connection string

---

## Running Locally

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
# Backend running on http://localhost:5000
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

### Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **API Testing:** Use Postman or curl

### Test API Endpoint

```bash
curl http://localhost:5000/api/products
# Expected response: {"success": true, "data": [...]}
```

---

## Deployment

### Vercel Deployment (Frontend)

1. **Connect Repository:**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Select your GitHub repository

2. **Configure Settings:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables:**
   - Settings → Environment Variables
   - Add all `VITE_*` variables

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main

### Render Deployment (Backend)

1. **Connect Repository:**
   - Go to https://dashboard.render.com
   - Click "New+" → "Web Service"
   - Select your GitHub repository

2. **Configure Settings:**
   - Name: agricart-backend
   - Environment: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

3. **Add Environment Variables:**
   - Environment tab
   - Add all variables (see Environment Variables section)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will deploy automatically

### After Deployment

1. **Update Vercel Environment:**
   - Add Render backend URL to `VITE_API_URL`
   - Example: `https://agricart-2toc.onrender.com/api`

2. **Update Render Environment:**
   - Set `FRONTEND_URL` to your Vercel domain
   - Example: `https://your-app.vercel.app`

3. **Redeploy Both:**
   - Push to GitHub or redeploy manually
   - Wait for both to complete

### Verify Deployment

```bash
# Test backend is running
curl https://agricart-2toc.onrender.com/

# Test frontend loads
curl https://your-app.vercel.app

# Test API connectivity
curl https://agricart-2toc.onrender.com/api/products
```

---

## API Documentation

### Base URL
- **Development:** http://localhost:5000/api
- **Production:** https://agricart-2toc.onrender.com/api

### Authentication

All protected routes require Bearer token from Clerk:
```
Authorization: Bearer <token>
```

### Endpoints

#### Products

```
GET    /api/products              # Get all products with filters
GET    /api/products/:id          # Get single product
POST   /api/products              # Create product (Farmer)
PUT    /api/products/:id          # Update product (Farmer)
DELETE /api/products/:id          # Delete product (Farmer)
GET    /api/products/farmer/my-products  # Get farmer's products
```

#### Users

```
POST   /api/users/sync            # Sync user after login
GET    /api/users/profile         # Get current user profile
PUT    /api/users/profile         # Update user profile
```

#### Orders

```
POST   /api/orders                # Create order
GET    /api/orders/my-orders      # Get consumer's orders
GET    /api/orders/farmer/sales   # Get farmer's orders
GET    /api/orders/:id            # Get order details
PUT    /api/orders/:id/payment    # Update order payment
```

#### Payments

```
GET    /api/payment/key           # Get Razorpay public key
POST   /api/payment/create-order  # Create Razorpay order
POST   /api/payment/verify        # Verify payment signature
```

#### Voice

```
POST   /api/voice/speech-to-text  # Convert speech to text
```

### Example API Call

```javascript
import api from './services/api';

// Get products
const response = await api.get('/products?category=Vegetables');
console.log(response.data.data);

// Create product (Farmer only)
const newProduct = await api.post('/products', {
  name: 'Tomato',
  description: 'Fresh red tomatoes',
  price: 50,
  category: 'Vegetables',
  stock: 100,
  images: ['url1', 'url2']
});
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed API examples.

---

## Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

**2. MongoDB connection error**
- Verify connection string in `.env`
- Add IP whitelist in MongoDB Atlas (0.0.0.0/0)
- Check internet connection

**3. Clerk authentication not working**
- Verify VITE_CLERK_PUBLISHABLE_KEY is correct
- Check Clerk dashboard for configuration
- Clear browser cache and local storage

**4. "CORS error" in browser console**
- Verify backend CORS configuration
- Check FRONTEND_URL is set correctly in backend
- Ensure both frontend and backend are running

**5. Build fails on Vercel/Render**
- Check build logs in dashboard
- Verify environment variables are set
- Test build locally: `npm run build`

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more detailed solutions.

---

## Development Workflow

### Create New Feature

1. **Create branch:**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make changes:**
   - Frontend: `frontend/src/...`
   - Backend: `backend/...`

3. **Test locally:**
   ```bash
   cd frontend && npm run dev
   cd backend && npm run dev
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add feature: feature-name"
   git push origin feature/feature-name
   ```

5. **Create Pull Request**

6. **Deploy:**
   - Merge to main
   - Both Vercel and Render automatically deploy

---

## Performance Tips

- **Frontend:**
  - Code splitting with React.lazy
  - Image optimization
  - Bundle analysis: `npm run build -- --stats`

- **Backend:**
  - Database indexing
  - Query optimization
  - Implement caching

- **Deployment:**
  - Enable CDN (Vercel default)
  - Use production database
  - Monitor with Vercel Analytics

---

## Security Best Practices

- ✅ Store secrets in environment variables
- ✅ Use HTTPS for all connections
- ✅ Validate all API inputs
- ✅ Use Clerk for authentication
- ✅ Implement rate limiting
- ✅ Don't commit `.env` files
- ✅ Use strong MongoDB passwords
- ✅ Enable CORS only for trusted domains

---

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Documentation:** See docs/ folder
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

## Resources

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Clerk Documentation](https://clerk.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [AssemblyAI Documentation](https://www.assemblyai.com/docs)

---

**Last Updated:** 2026-02-11  
**Version:** 1.0.0  
**Status:** Production Ready
