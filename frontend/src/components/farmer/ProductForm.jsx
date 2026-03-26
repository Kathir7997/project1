import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ProductForm = ({ product, onSubmit, onCancel, isSubmitting = false }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Vegetables',
        stock: '',
        quantity: '1 unit',
        images: [], // Existing images (URLs)
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [localSubmitting, setLocalSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || 'Vegetables',
                stock: product.stock || '',
                quantity: product.quantity || '1 unit',
                images: product.images || [],
            });
        }
    }, [product]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('stock', formData.stock);
        data.append('quantity', formData.quantity);

        // Add farmerId from authenticated user
        if (user && user.id) {
            data.append('farmerId', user.id);
        }

        // Append existing images (if any logic needed specifically for them, usually backend handles persistence)
        // For now, we only send NEW files. Backend appends them.
        // If we wanted to delete existing images, we'd need a separate mechanism or field.

        selectedFiles.forEach(file => {
            data.append('images', file);
        });

        setLocalSubmitting(true);
        try {
            await onSubmit(data);
        } finally {
            setLocalSubmitting(false);
        }
    };

    const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic', 'Seeds', 'Tools', 'Other'];
    const isProcessing = isSubmitting || localSubmitting;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        required
                        disabled={isProcessing}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-field"
                        rows="3"
                        required
                        disabled={isProcessing}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="input-field"
                            min="0"
                            step="0.01"
                            required
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="input-field"
                            min="0"
                            required
                            disabled={isProcessing}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity / Unit</label>
                        <input
                            type="text"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g. 1 kg, 1 Dozen"
                            required
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="input-field"
                        disabled={isProcessing}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

                    {/* Existing Images */}
                    {formData.images.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                            <div className="flex flex-wrap gap-2">
                                {formData.images.map((img, index) => (
                                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative group">
                                        <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors bg-gray-50">
                        <div className="flex flex-col items-center justify-center">
                            <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-1">Click to upload images</p>
                            <p className="text-xs text-gray-400 mb-4">PNG, JPG up to 5MB</p>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {/* New Image Previews */}
                    {previewUrls.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">New Images to Upload:</p>
                            <div className="flex flex-wrap gap-2">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative group">
                                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                            disabled={isProcessing}
                                            title="Remove image"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-100">
                <button 
                    type="submit" 
                    className="btn-primary flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                        </span>
                    ) : (
                        product ? 'Update Product' : 'Add Product'
                    )}
                </button>
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="btn-outline flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default ProductForm;

