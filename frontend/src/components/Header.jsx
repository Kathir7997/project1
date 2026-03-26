import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaHeart, FaLeaf, FaSignOutAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const Header = ({ role }) => {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/sign-in');
        } catch (error) {
            console.error('Logout error:', error);
            // Still navigate even if logout fails
            navigate('/sign-in');
        }
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to={role === 'Farmer' ? '/farmer/dashboard' : '/consumer/home'} className="flex items-center space-x-2">
                        <FaLeaf className="text-primary-600 text-3xl" />
                        <span className="text-2xl font-bold text-primary-700">Agricart</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {role === 'Farmer' ? (
                            <>
                                <Link to="/farmer/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Dashboard
                                </Link>
                                <Link to="/farmer/products" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Products
                                </Link>
                                <Link to="/farmer/orders" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Orders
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/consumer/home" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Home
                                </Link>
                                <Link to="/consumer/products" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Products
                                </Link>
                                <Link to="/consumer/wishlist" className="relative text-gray-700 hover:text-primary-600 transition">
                                    <FaHeart className="text-xl" />
                                </Link>
                                <Link to="/consumer/cart" className="relative text-gray-700 hover:text-primary-600 transition">
                                    <FaShoppingCart className="text-xl" />
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </Link>
                                <Link to="/consumer/orders" className="text-gray-700 hover:text-primary-600 font-medium transition">
                                    Orders
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600 hidden md:inline">
                            {user?.name || 'User'} ({role})
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
                            title="Logout"
                        >
                            <FaSignOutAlt />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
