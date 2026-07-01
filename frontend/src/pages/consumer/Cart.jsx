import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header role="Consumer" />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some products to get started!</p>
                    <Link to="/consumer/products" className="btn-primary inline-block">
                        Browse Products
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({getCartCount()} items)</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="card">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Product Image */}
                                    <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/consumer/product/${item._id}`} className="text-lg font-semibold text-gray-800 hover:text-primary-600 block">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                                        <p className="text-xl font-bold text-primary-600">₹{item.price}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between mt-4 sm:mt-0 w-full sm:w-auto">
                                        <p className="font-semibold text-gray-700 sm:hidden">Total: ₹{item.price * item.quantity}</p>
                                        
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={item.quantity <= 1}
                                                title="Decrease quantity"
                                            >
                                                <FaMinus className="text-sm" />
                                            </button>
                                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="bg-gray-200 p-2 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={item.quantity >= item.stock}
                                                title="Increase quantity"
                                            >
                                                <FaPlus className="text-sm" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded transition ml-4 sm:ml-0"
                                            title="Remove from cart"
                                        >
                                            <FaTrash />
                                        </button>
                                        
                                        <p className="font-semibold text-gray-700 hidden sm:block">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-800">
                                    <span>Total</span>
                                    <span>₹{getCartTotal()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/consumer/checkout')}
                                className="btn-primary w-full"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to="/consumer/products"
                                className="btn-outline w-full mt-3 block text-center"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Cart;
