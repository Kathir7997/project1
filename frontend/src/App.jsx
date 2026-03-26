import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import ClerkSignInPage from './pages/ClerkSignInPage';
import ClerkSignUpPage from './pages/ClerkSignUpPage';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import ManageProducts from './pages/farmer/ManageProducts';
import FarmerOrders from './pages/farmer/FarmerOrders';
import HomePage from './pages/consumer/HomePage';
import ProductsPage from './pages/consumer/ProductsPage';
import ProductDetail from './pages/consumer/ProductDetail';
import Cart from './pages/consumer/Cart';
import Wishlist from './pages/consumer/Wishlist';
import Checkout from './pages/consumer/Checkout';
import OrderHistory from './pages/consumer/OrderHistory';
import Profile from './pages/consumer/Profile';

function App() {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/sign-in/*" element={<ClerkSignInPage />} />
                <Route path="/sign-up/*" element={<ClerkSignUpPage />} />

                {/* Farmer Routes */}
                <Route
                    path="/farmer/dashboard"
                    element={
                        <ProtectedRoute requiredRole="Farmer">
                            <FarmerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/products"
                    element={
                        <ProtectedRoute requiredRole="Farmer">
                            <ManageProducts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/farmer/orders"
                    element={
                        <ProtectedRoute requiredRole="Farmer">
                            <FarmerOrders />
                        </ProtectedRoute>
                    }
                />

                {/* Consumer Routes */}
                <Route
                    path="/consumer/home"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/products"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <ProductsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/product/:id"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <ProductDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/cart"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <Cart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/wishlist"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <Wishlist />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/checkout"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <Checkout />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/orders"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <OrderHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consumer/profile"
                    element={
                        <ProtectedRoute requiredRole="Consumer">
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
