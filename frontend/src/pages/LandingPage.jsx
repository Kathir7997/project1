import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaTractor, FaShoppingCart, FaHeart } from 'react-icons/fa';
import farmingBg from '../assets/farming-bg.png';

const LandingPage = () => {
    const { isAuthenticated, user, updateUser } = useAuth();

    if (isAuthenticated && user) {
        // Redirect to role-specific dashboard
        if (user.role === 'Farmer') {
            return <Navigate to="/farmer/dashboard" replace />;
        } else if (user.role === 'Consumer') {
            return <Navigate to="/consumer/home" replace />;
        }
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-fixed relative"
            style={{ backgroundImage: `url(${farmingBg})` }}
        >
            {/* Global overlay */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Content wrapper */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <FaLeaf className="text-6xl mx-auto mb-6 animate-bounce drop-shadow-lg" />
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">Welcome to Agricart</h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-lg">
                            Connecting farmers directly with consumers for fresh, organic produce
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <Link to="/sign-in" className="w-full md:w-auto bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg text-center">
                                Login
                            </Link>
                            <Link to="/sign-up" className="w-full md:w-auto bg-earth-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-earth-700 transition shadow-lg text-center">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white drop-shadow-lg">
                            How Agricart Works
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Farmer */}
                            <div className="text-center bg-white/8 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl hover:bg-white/12 hover:scale-105 transition-all duration-300">
                                <FaTractor className="text-5xl text-primary-400 mx-auto mb-4 drop-shadow-lg" />
                                <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">For Farmers</h3>
                                <ul className="text-left space-y-2 text-white drop-shadow-lg">
                                    <li>✓ List your products directly</li>
                                    <li>✓ Manage inventory and pricing</li>
                                    <li>✓ Track sales and revenue</li>
                                    <li>✓ Receive orders instantly</li>
                                </ul>
                                <Link to="/sign-up" className="mt-6 inline-block bg-primary-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-xl border border-white/20">
                                    Register as Farmer
                                </Link>
                            </div>

                            {/* Consumer */}
                            <div className="text-center bg-white/8 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl hover:bg-white/12 hover:scale-105 transition-all duration-300">
                                <FaShoppingCart className="text-5xl text-primary-400 mx-auto mb-4 drop-shadow-lg" />
                                <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">For Consumers</h3>
                                <ul className="text-left space-y-2 text-white drop-shadow-lg">
                                    <li>✓ Browse fresh produce</li>
                                    <li>✓ Voice search products</li>
                                    <li>✓ Secure payment gateway</li>
                                    <li>✓ Order tracking</li>
                                </ul>
                                <Link to="/sign-up" className="mt-6 inline-block bg-primary-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-xl border border-white/20">
                                    Shop Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-earth-800/90 backdrop-blur-sm text-white py-8">
                    <div className="container mx-auto px-4 text-center">
                        <p>&copy; {new Date().getFullYear()} Agricart. Farm to Home.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
