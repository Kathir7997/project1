import React from 'react';

const OrderList = ({ orders, onStatusUpdate }) => {
    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-gray-500 mt-1">Orders will appear here once customers make a purchase.</p>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Packed': return 'bg-blue-100 text-blue-800';
            case 'Shipped': return 'bg-indigo-100 text-indigo-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="divide-y divide-gray-100">
            {orders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 flex gap-4">
                                <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                                <span>🕒 {new Date(order.createdAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-primary-700">
                                ₹{order.products.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Product</th>
                                    <th className="px-4 py-3 font-semibold text-center">Qty</th>
                                    <th className="px-4 py-3 font-semibold text-right">Price</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.products.map((item, idx) => (
                                    <tr key={`${order._id}-${idx}`} className="group">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">ID: {item.productId._id?.slice(-4)}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">₹{item.price}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status || 'Pending')}`}>
                                                {item.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className="text-sm border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white py-1 pl-2 pr-8 shadow-sm"
                                                value={item.status || 'Pending'}
                                                onChange={(e) => onStatusUpdate && onStatusUpdate(order._id, item.productId._id, e.target.value)}
                                                disabled={!onStatusUpdate}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Packed">Packed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderList;
