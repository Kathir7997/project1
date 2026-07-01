import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaSearch } from 'react-icons/fa';
import FarmerLayout from '../../components/farmer/FarmerLayout';
import ProductForm from '../../components/farmer/ProductForm';
import ProductTable from '../../components/farmer/ProductTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products/farmer/${user.id}`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (productData) => {
        try {
            const response = await api.post('/products', productData);
            setProducts((prev) => [...prev, response.data.data]);
            setShowForm(false);
            toast.success('Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add product';
            toast.error(errorMessage);
        }
    };

    const handleUpdateProduct = async (productData) => {
        try {
            const response = await api.put(`/products/${editingProduct._id}`, productData);
            setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? response.data.data : p)));
            setEditingProduct(null);
            setShowForm(false);
            toast.success('Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${productId}`);
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success('Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <FarmerLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your inventory and catalog</p>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
                    >
                        <FaPlus />
                        Add New Product
                    </button>
                )}
            </header>

            {showForm ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button
                            onClick={() => { setShowForm(false); setEditingProduct(null); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    <ProductForm
                        product={editingProduct}
                        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingProduct(null);
                        }}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            Total: <span className="font-bold text-gray-800">{filteredProducts.length}</span>
                        </div>
                    </div>

                    <div className="p-0">
                        <ProductTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDeleteProduct} />
                    </div>
                </div>
            )}
        </FarmerLayout>
    );
};

export default ManageProducts;
