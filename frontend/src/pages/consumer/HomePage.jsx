import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaLeaf } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const HomePage = () => {
    const { user } = useAuth();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await api.get('/products?sort=-createdAt');
            setFeaturedProducts(response.data.data?.slice(0, 8) || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop' },
        { name: 'Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop' },
        { name: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' },
        { name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop' },
        { name: 'Organic', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop' },
        { name: 'Seeds', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop' }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1">
                {/* Hero Section */}
                <section
                    className="relative text-white py-20 bg-cover bg-center"
                    style={{
                        backgroundImage: `linear-gradient(rgba(22, 163, 74, 0.7), rgba(21, 128, 61, 0.7)), url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=600&fit=crop')`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}
                >
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <FaLeaf className="text-5xl mx-auto mb-4 animate-bounce" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                            Fresh from Farm to Your Home
                        </h1>
                        <p className="text-xl mb-8 drop-shadow-md">Discover organic products directly from local farmers</p>
                        <Link to="/consumer/products" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center space-x-2 shadow-lg">
                            <FaSearch />
                            <span>Browse Products</span>
                        </Link>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    to={`/consumer/products?category=${category.name}`}
                                    className="card text-center hover:shadow-xl transition group overflow-hidden"
                                >
                                    <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <p className="font-semibold text-gray-700">{category.name}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Products */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Products</h2>
                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredProducts.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HomePage;
