# Agricart - Farm to Home E-commerce Platform

A full-stack MERN application connecting farmers directly with consumers for fresh, organic produce. Features role-based authentication, voice search, and integrated payment processing.

## 🌾 Features

### For Farmers
- **Dashboard**: Overview of products, sales, and revenue
- **Product Management**: Add, edit, and delete products with images
- **Order Tracking**: View and manage customer orders
- **Analytics**: Sales charts and revenue tracking
- **Inventory Management**: Real-time stock tracking

### For Consumers
- **Product Browsing**: Search and filter products by category
- **Voice Search**: AI-powered voice search using AssemblyAI
- **Shopping Cart**: Add, update, and manage cart items
- **Wishlist**: Save favorite products
- **Secure Checkout**: Razorpay payment integration
- **Order History**: Track past purchases
- **User Profile**: Manage account information

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **Clerk** - Authentication & user management
- **Razorpay** - Payment gateway
- **AssemblyAI** - Speech-to-text for voice search
- **Multer** - File upload handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Context API** - State management

## 📁 Project Structure

```
farmcart/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   ├── userController.js
│   │   └── voiceController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   └── voiceRoutes.js
│   ├── utils/
│   │   └── helpers.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── farmer/
│   │   │   │   ├── OrderList.jsx
│   │   │   │   ├── ProductTable.jsx
│   │   │   │   ├── SalesChart.jsx
│   │   │   │   └── StatCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── VoiceSearch.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx
│   │   │   └── WishlistContext.jsx
│   │   ├── pages/
│   │   │   ├── consumer/
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Checkout.jsx
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   ├── ProductsPage.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Wishlist.jsx
│   │   │   ├── farmer/
│   │   │   │   ├── FarmerDashboard.jsx
│   │   │   │   ├── FarmerOrders.jsx
│   │   │   │   └── ManageProducts.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleBasedRedirect.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── API_DOCUMENTATION.md
├── README.md
└── SETUP_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Clerk account
- Razorpay account
- AssemblyAI account

### Installation

1. **Clone the repository**
```bash
cd d:/project/farmcart
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:5173`.

## 🔑 Environment Variables

See `.env.example` files in both `backend` and `frontend` directories.

### Backend (.env)
- `MONGODB_URI` - MongoDB connection string
- `CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` - Clerk authentication
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Razorpay payment
- `ASSEMBLYAI_API_KEY` - AssemblyAI voice recognition
- `PORT` - Server port (default: 5000)

### Frontend (.env)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key
- `VITE_API_URL` - Backend API URL

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [API Documentation](./API_DOCUMENTATION.md) - API endpoints reference

## 🎨 Design Features

- **Farming Theme**: Green and earth-tone color palette
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean cards, smooth transitions, and animations
- **Accessible**: Semantic HTML and ARIA labels

## 🔒 Security Features

- JWT-based authentication via Clerk
- Role-based access control (Farmer/Consumer)
- Payment signature verification
- CORS protection
- Environment variable protection

## 📱 User Flows

### Farmer Flow
1. Sign up with role "Farmer"
2. Redirected to Farmer Dashboard
3. Add products with details and images
4. Track sales and revenue
5. Manage incoming orders

### Consumer Flow
1. Sign up with role "Consumer"
2. Browse products or use voice search
3. Add items to cart/wishlist
4. Checkout with Razorpay
5. View order history

## 🤝 Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## 📄 License

ISC

## 👨‍💻 Author

Created for Agricart Platform

---

**Happy Farming! 🌾**
