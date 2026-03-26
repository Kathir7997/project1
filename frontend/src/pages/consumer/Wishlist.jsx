import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (product) => {
        addToCart(product, 1);
        removeFromWishlist(product._id);
        toast.success('Moved to cart!');
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header role="Consumer" />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-6">Save your favorite products here!</p>
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
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    My Wishlist ({wishlistItems.length} items)
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                        <div key={product._id} className="card">
                            {/* Product Image */}
                            <Link to={`/consumer/product/${product._id}`}>
                                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                    {product.images && product.images[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Product Info */}
                            <Link to={`/consumer/product/${product._id}`}>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary-600">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                            <p className="text-2xl font-bold text-primary-600 mb-4">₹{product.price}</p>

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleMoveToCart(product)}
                                    disabled={product.stock === 0}
                                    className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                    title="Add to cart"
                                >
                                    <FaShoppingCart />
                                    <span>Add to Cart</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeFromWishlist(product._id)}
                                    className="btn-outline px-4 transition hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                    title="Remove from wishlist"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Wishlist;
