import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import VoiceSearch from '../../components/VoiceSearch';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic', 'Seeds', 'Tools', 'Other'];

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await api.get(`/products?${params.toString()}`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e?.preventDefault();
        fetchProducts();
    };

    const handleVoiceTranscript = (text) => {
        setSearchQuery(text);
        setTimeout(() => fetchProducts(), 100);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for products..."
                                className="input-field flex-1"
                            />
                            <button type="submit" className="btn-primary">
                                <FaSearch />
                            </button>
                            <VoiceSearch onTranscript={handleVoiceTranscript} />
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn-outline md:hidden"
                        >
                            <FaFilter className="inline mr-2" />
                            Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className={`w-full md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="card sticky top-24">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Categories</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`w-full text-left px-3 py-2 rounded transition ${selectedCategory === '' ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    All Products
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 rounded transition ${selectedCategory === category ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="mb-4">
                            <p className="text-gray-600">
                                {loading ? 'Loading...' : `${products.length} products found`}
                            </p>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No products found. Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductsPage;
