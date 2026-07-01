import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBox, FaCreditCard, FaMobileAlt, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [updatingPayment, setUpdatingPayment] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            console.log('[ORDERS] Fetching orders for current user');
            const response = await api.get('/orders/me');
            console.log('[ORDERS] Response received:', response.data);
            
            if (response.data?.success) {
                setOrders(response.data.data || []);
                console.log('[ORDERS] Orders loaded successfully:', (response.data.data || []).length);
            } else {
                console.error('[ORDERS] API returned success:false');
                toast.error('Failed to load orders');
            }
        } catch (error) {
            console.error('[ORDERS] Error fetching orders:', {
                message: error.message,
                status: error.status,
                data: error.data,
                userId: user?.id,
                userRole: user?.role
            });
            
            const errorMsg = error.message || error.error || 'Failed to load orders';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            // Check if Razorpay is already loaded
            if (window.Razorpay) {
                console.log('[RAZORPAY] Already loaded');
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                console.log('[RAZORPAY] Script loaded successfully');
                resolve(true);
            };
            script.onerror = () => {
                console.error('[RAZORPAY] Failed to load script');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const validateUPIId = (upi) => {
        // Basic UPI validation
        const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
        return upiRegex.test(upi);
    };

    const handleUpdatePaymentMethod = async () => {
        try {
            if (!newPaymentMethod) {
                toast.error('Please select a payment method');
                return;
            }

            // Validate UPI ID if UPI is selected
            if (newPaymentMethod === 'upi') {
                if (!upiId.trim()) {
                    toast.error('Please enter UPI ID');
                    return;
                }
                if (!validateUPIId(upiId)) {
                    toast.error('Invalid UPI ID format. Use format like: username@bankname');
                    return;
                }
            }

            setUpdatingPayment(true);
            console.log('[ORDERS] Updating payment method for order:', selectedOrder._id);

            // For online payments (UPI, Card, etc.), integrate with Razorpay
            if (newPaymentMethod !== 'cod') {
                const isRazorpayLoaded = await loadRazorpayScript();
                if (!isRazorpayLoaded) {
                    toast.error('Failed to load payment gateway. Please try again.');
                    setUpdatingPayment(false);
                    return;
                }

                // Validate that Razorpay object exists
                if (!window.Razorpay) {
                    toast.error('Payment gateway not available. Please try again.');
                    setUpdatingPayment(false);
                    return;
                }

                // Create Razorpay order for the updated payment method
                try {
                    console.log('[RAZORPAY] Requesting payment order creation for amount:', selectedOrder.totalAmount);
                    const orderResponse = await api.post('/payment/create-order', {
                        orderId: selectedOrder._id,
                        amount: selectedOrder.totalAmount,
                        paymentMethod: newPaymentMethod,
                    });

                    console.log('[RAZORPAY] Order response received:', orderResponse.data);
                    if (!orderResponse.data?.data?.razorpayOrderId) {
                        throw new Error(orderResponse.data?.message || 'Failed to create payment order');
                    }

                    const { razorpayOrderId, amount, currency } = orderResponse.data.data;

                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SEOim7okVIblZC',
                        amount: Math.round(amount * 100), // Razorpay requires amount in paise
                        currency: currency || 'INR',
                        order_id: razorpayOrderId,
                        description: `Payment for Order #${selectedOrder._id.substring(0, 8)}`,
                        prefill: {
                            name: user?.name || 'Customer',
                            email: user?.email || '',
                        },
                        theme: {
                            color: '#10b981',
                        },
                        handler: async (response) => {
                            try {
                                console.log('[RAZORPAY] Payment successful:', response.razorpay_payment_id);

                                // Update order with new payment method and mark as completed
                                const updateResponse = await api.put(`/orders/${selectedOrder._id}/payment-method`, {
                                    paymentMethod: newPaymentMethod,
                                    upiId: newPaymentMethod === 'upi' ? upiId : undefined,
                                    razorpayOrderId: razorpayOrderId,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    razorpaySignature: response.razorpay_signature,
                                    markAsCompleted: true
                                });

                                if (updateResponse.data?.success) {
                                    console.log('[RAZORPAY] Order updated successfully');
                                    toast.success('✓ Payment completed! Order updated.');
                                    
                                    // Update order in list
                                    setOrders(orders.map(order => 
                                        order._id === selectedOrder._id ? updateResponse.data.data : order
                                    ));
                                    
                                    closePaymentModal();
                                } else {
                                    throw new Error(updateResponse.data?.message || 'Failed to update order');
                                }
                            } catch (error) {
                                console.error('[RAZORPAY] Error updating order:', error);
                                toast.error('Payment received but failed to update order. Contacting support...');
                            } finally {
                                setUpdatingPayment(false);
                            }
                        },
                        modal: {
                            ondismiss: () => {
                                console.log('[RAZORPAY] Payment modal dismissed');
                                setUpdatingPayment(false);
                                toast.info('Payment cancelled');
                            }
                        }
                    };

                    console.log('[RAZORPAY] Opening payment gateway with options:', { key: options.key, amount: options.amount });
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } catch (apiError) {
                    console.error('[RAZORPAY] API Error:', apiError);
                    const errMsg = apiError.message || apiError.data?.message || 'Failed to initialize payment';
                    toast.error(errMsg);
                    setUpdatingPayment(false);
                }
            } else {
                // For COD, just update without Razorpay
                try {
                    const response = await api.put(`/orders/${selectedOrder._id}/payment-method`, {
                        paymentMethod: newPaymentMethod,
                        upiId: undefined
                    });

                    if (response.data?.success) {
                        console.log('[ORDERS] Payment method updated successfully to COD');
                        toast.success('✓ Payment method updated to Cash on Delivery!');
                        
                        // Update order in list
                        setOrders(orders.map(order => 
                            order._id === selectedOrder._id ? response.data.data : order
                        ));
                        
                        closePaymentModal();
                    } else {
                        throw new Error(response.data?.message || 'Failed to update payment method');
                    }
                } catch (error) {
                    console.error('[ORDERS] Error updating to COD:', error);
                    const errorMsg = error.message || error.error || 'Failed to update payment method';
                    toast.error(errorMsg);
                } finally {
                    setUpdatingPayment(false);
                }
            }
        } catch (error) {
            console.error('[ORDERS] Unexpected error:', error);
            const errorMsg = error.message || error.error || 'An unexpected error occurred';
            toast.error(errorMsg);
            setUpdatingPayment(false);
        }
    };

    const openPaymentModal = (order) => {
        setSelectedOrder(order);
        setNewPaymentMethod('');
        setUpiId('');
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedOrder(null);
        setNewPaymentMethod('');
        setUpiId('');
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header role="Consumer" />
                <main className="flex-1 container mx-auto px-4 py-8 text-center">
                    <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
                    <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="card">
                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Order #{order._id.substring(0, 8)}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                                 order.paymentMethod === 'upi' ? 'UPI' : order.paymentMethod.toUpperCase()}
                                    </p>
                                </div>
                                <div className="mt-2 md:mt-0 flex flex-col items-end gap-3">
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-medium ${order.paymentStatus === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : order.paymentStatus === 'pending'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : order.paymentStatus === 'processing'
                                                    ? 'bg-blue-100 text-blue-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {order.paymentStatus === 'completed' ? 'Completed' : order.paymentStatus === 'pending' ? 'Pending' : order.paymentStatus === 'processing' ? 'Processing' : 'Failed'}
                                    </span>
                                    
                                    {/* Show update button only for COD pending orders */}
                                    {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                                        <button
                                            onClick={() => openPaymentModal(order)}
                                            className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                                        >
                                            Update Payment
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {order.products.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                        item.status === 'Packed' ? 'bg-indigo-100 text-indigo-700' :
                                                            item.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {item.status || 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Total */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{order.totalAmount - (order.deliveryCharge || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">₹{order.deliveryCharge || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="font-semibold text-gray-700">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Payment Update Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Update Payment Method</h2>
                            <button
                                onClick={closePaymentModal}
                                className="text-gray-500 hover:text-gray-700 transition"
                                disabled={updatingPayment}
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {selectedOrder && (
                            <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-700">
                                <p className="font-medium">Order #{selectedOrder._id.substring(0, 8)}</p>
                                <p className="text-xs mt-1">Current: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod.toUpperCase()}</p>
                                <p className="text-xs mt-1 font-medium">Amount: ₹{selectedOrder.totalAmount}</p>
                            </div>
                        )}

                        <div className="space-y-3 mb-6">
                            {/* COD Option */}
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={newPaymentMethod === 'cod'}
                                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                                    disabled={updatingPayment}
                                    className="w-4 h-4"
                                />
                                <FaMoneyBillWave className="ml-3 text-green-600" size={18} />
                                <span className="ml-2 font-medium text-gray-700">Cash on Delivery</span>
                            </label>

                            {/* UPI Option */}
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="upi"
                                    checked={newPaymentMethod === 'upi'}
                                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                                    disabled={updatingPayment}
                                    className="w-4 h-4"
                                />
                                <FaMobileAlt className="ml-3 text-blue-600" size={18} />
                                <span className="ml-2 font-medium text-gray-700">UPI (GPay, PhonePe, Paytm)</span>
                            </label>

                            {/* Card Option */}
                            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={newPaymentMethod === 'card'}
                                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                                    disabled={updatingPayment}
                                    className="w-4 h-4"
                                />
                                <FaCreditCard className="ml-3 text-purple-600" size={18} />
                                <span className="ml-2 font-medium text-gray-700">Credit/Debit Card</span>
                            </label>
                        </div>

                        {/* UPI ID Input */}
                        {newPaymentMethod === 'upi' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    disabled={updatingPayment}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">e.g., yourname@okhdfcbank or yourname@oksbi</p>
                            </div>
                        )}

                        {/* Info Message for Online Payments */}
                        {newPaymentMethod && newPaymentMethod !== 'cod' && (
                            <div className="mb-6 bg-green-50 p-3 rounded text-xs text-green-700">
                                <p className="font-medium">✓ Will proceed to secure payment gateway (Razorpay)</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={closePaymentModal}
                                disabled={updatingPayment}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePaymentMethod}
                                disabled={updatingPayment || !newPaymentMethod}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingPayment ? 'Processing...' : 'Update Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OrderHistory;
