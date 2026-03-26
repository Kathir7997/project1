import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductImage } from '../utils/imageHelpers';

const ProductCard = ({ product, showActions = true }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            addToCart(product, 1);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (inWishlist) {
                removeFromWishlist(product._id);
            } else {
                addToWishlist(product);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    return (
        <Link to={`/consumer/product/${product._id}`} className="card group cursor-pointer">
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-lg mb-4 h-48 bg-gray-100">
                <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 bg-earth-100 px-2 py-1 rounded">{product.category}</span>
                <span className="text-sm text-gray-600">Stock: {product.stock}</span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-primary-600">₹{product.price}</span>

                {showActions && (
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleWishlistToggle}
                            className={`p-2 rounded-full transition hover:-translate-y-0.5 ${inWishlist ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                                }`}
                            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <FaHeart />
                        </button>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed hover:-translate-y-0.5"
                            title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                        >
                            <FaShoppingCart />
                        </button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
