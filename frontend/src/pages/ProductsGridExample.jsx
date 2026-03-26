import { useState, useEffect } from 'react';
import { productAPI } from '../services/endpoints';
import toast from 'react-hot-toast';

/**
 * Example: Fetch Products Component
 * Shows how to properly use API service with environment variables
 * 
 * Key Points:
 * - Uses centralized API service (api.js)
 * - Handles loading and error states
 * - Shows proper error handling
 * - Demonstrates filters/params usage
 */
export function ProductsGridExample() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API through centralized service
      const response = await productAPI.getProducts({
        category: category !== 'All' ? category : undefined,
      });

      if (response.data.success) {
        setProducts(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(message);
      console.error('[ProductsGrid] Error:', err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 flex gap-2">
        {['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded ${
              category === cat
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product._id} className="border rounded-lg p-4 hover:shadow-lg">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.category}</p>
              <p className="text-lg font-bold text-green-600">₹{product.price}</p>
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsGridExample;
