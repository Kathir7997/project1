import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBox, FaDollarSign, FaShoppingBag, FaTruck } from 'react-icons/fa';
import FarmerLayout from '../../components/farmer/FarmerLayout';
import StatCard from '../../components/farmer/StatCard';
import SalesChart from '../../components/farmer/SalesChart';
import OrderList from '../../components/farmer/OrderList';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [productsRes, ordersRes] = await Promise.all([
                api.get(`/products/farmer/${user.id}`),
                api.get(`/orders/farmer/${user.id}`),
            ]);
            setProducts(productsRes.data.data || []);
            setOrders(ordersRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalProducts = products.length;
    const totalSold = products.reduce((sum, p) => sum + (p.totalSold || 0), 0);
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.products.reduce((s, item) => s + item.price * item.quantity, 0);
        return sum + orderTotal;
    }, 0);
    const pendingOrders = orders.filter(o => o.products.some(p => p.status === 'Pending')).length;

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <FarmerLayout>
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.name} 👋</p>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {user?.name?.[0]}
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FaBox}
                    label="Total Products"
                    value={totalProducts}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={FaShoppingBag}
                    label="Total Sales"
                    value={totalSold}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    icon={FaDollarSign}
                    label="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    icon={FaTruck}
                    label="Pending Orders"
                    value={pendingOrders}
                    color="bg-orange-50 text-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Overview</h2>
                    <div className="h-64 w-full">
                        <SalesChart orders={orders} />
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Orders</h2>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <FaShoppingBag />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Order #{order._id.slice(-6)}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <p className="text-center text-gray-400 py-4">No recent orders</p>
                        )}
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
};

export default FarmerDashboard;
