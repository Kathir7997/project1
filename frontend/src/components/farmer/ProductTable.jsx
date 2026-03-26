import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { getProductImage } from '../../utils/imageHelpers';

const ProductTable = ({ products, onEdit, onDelete }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🥬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                <p className="text-gray-500 mt-1">Start by adding your first product to the inventory.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Price</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Stock</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Sold</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900">₹{product.price}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-blue-50 text-blue-700' : product.stock > 0 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-600">{product.totalSold || 0}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(product)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hover:-translate-y-0.5"
                                        title="Edit product"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(product._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:-translate-y-0.5"
                                        title="Delete product"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
