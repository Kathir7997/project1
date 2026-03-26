import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaSearch } from 'react-icons/fa';
import FarmerLayout from '../../components/farmer/FarmerLayout';
import OrderList from '../../components/farmer/OrderList';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FarmerOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            if (!user?.id) {
                console.warn('[FARMER_ORDERS] User ID not available');
                setLoading(false);
                return;
            }

            console.log('[FARMER_ORDERS] Fetching orders for farmer:', user.id);
            const response = await api.get(`/orders/farmer/${user.id}`);
            console.log('[FARMER_ORDERS] Response received:', response.data);
            
            if (response.data?.success) {
                setOrders(response.data.data || []);
                console.log('[FARMER_ORDERS] Orders loaded:', (response.data.data || []).length);
            } else {
                console.error('[FARMER_ORDERS] API returned success:false');
                toast.error('Failed to load orders');
            }
        } catch (error) {
            console.error('[FARMER_ORDERS] Error fetching orders:', {
                message: error.message,
                status: error.status,
                data: error.data,
                userId: user?.id
            });
            
            const errorMsg = error.message || error.error || 'Failed to load orders';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, productId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, {
                orderStatus: newStatus,
                productId: productId
            });

            // Update local state
            setOrders(prevOrders => prevOrders.map(order => {
                if (order._id === orderId) {
                    return {
                        ...order,
                        products: order.products.map(p =>
                            p.productId._id === productId ? { ...p, status: newStatus } : p
                        )
                    };
                }
                return order;
            }));

            toast.success('Order status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesFilter = filter === 'all' || order.paymentStatus === filter;
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <FarmerLayout>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-500 mt-1">Track and manage your customer orders</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                    {/* Filters */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        {['all', 'completed', 'pending'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === status
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Product..."
                            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Order List */}
                <OrderList orders={filteredOrders} onStatusUpdate={handleStatusUpdate} />
            </div>
        </FarmerLayout>
    );
};

export default FarmerOrders;
