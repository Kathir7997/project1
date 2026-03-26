import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductImage } from '../../utils/imageHelpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        try {
            if (product) {
                addToCart(product, quantity);
                toast.success('Added to cart!');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const handleWishlistToggle = () => {
        try {
            if (!product) return;

            if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
                toast.success('Removed from wishlist');
            } else {
                addToWishlist(product);
                toast.success('Added to wishlist!');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist');
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!product) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header role="Consumer" />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <p className="text-gray-600">Product not found</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <button 
                    type="button"
                    onClick={() => navigate(-1)} 
                    className="flex items-center text-primary-600 hover:text-primary-700 mb-6 hover:gap-3 transition-all duration-200"
                    title="Go back"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Products
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div>
                        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                            <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-sm text-gray-600 mb-4">
                            <span className="bg-earth-100 text-earth-700 px-3 py-1 rounded">{product.category}</span>
                        </p>

                        <div className="mb-6">
                            <p className="text-4xl font-bold text-primary-600 mb-2">₹{product.price}</p>
                            <p className="text-gray-600">
                                Stock: <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                                </span>
                            </p>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
                            <p className="text-gray-600">{product.description}</p>
                        </div>

                        {product.stock > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                                    min="1"
                                    max={product.stock}
                                    className="input-field w-32"
                                />
                            </div>
                        )}

                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                            >
                                <FaShoppingCart />
                                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleWishlistToggle}
                                className={`btn-outline px-6 transition ${isInWishlist(product._id) ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100' : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600'}`}
                                title={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <FaHeart />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetail;
