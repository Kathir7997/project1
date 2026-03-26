import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaMoneyBillWave, FaMobileAlt, FaCreditCard } from 'react-icons/fa';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/imageHelpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [upiId, setUpiId] = useState('');

    // Address state
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
    });

    const deliveryCharge = 50; // Fixed delivery charge - can be made dynamic based on farmer

    if (cartItems.length === 0) {
        navigate('/consumer/cart');
        return null;
    }

    const paymentOptions = [
        { id: 'cod', name: 'Cash on Delivery', icon: FaMoneyBillWave, color: 'text-green-600' },
        { id: 'upi', name: 'UPI (PhonePe, GPay, Paytm)', icon: FaMobileAlt, color: 'text-blue-600' },
        { id: 'card', name: 'Credit / Debit Card', icon: FaCreditCard, color: 'text-purple-600' },
    ];

    const handleAddressChange = (field, value) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    const validateAddress = () => {
        const { fullName, phone, addressLine1, city, state, pincode } = address;
        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            toast.error('Please fill in all required address fields');
            return false;
        }
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return false;
        }
        if (pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return false;
        }
        return true;
    };

    const handlePlaceOrder = async () => {
        setProcessing(true);
        try {
            // Validate auth
            if (!user) {
                toast.error('You must be logged in to place an order');
                setProcessing(false);
                return;
            }

            // Validate address
            if (!validateAddress()) {
                setProcessing(false);
                return;
            }

            // Validate UPI ID if UPI is selected
            if (paymentMethod === 'upi' && !upiId) {
                toast.error('Please enter UPI ID');
                setProcessing(false);
                return;
            }

            // Create order data
            const orderData = {
                consumerId: user.id || user.clerkId, // Ensure consumerId is passed explicitly
                products: cartItems.map((item) => ({
                    productId: item._id,
                    farmerId: item.farmerId || 'unknown-farmer', // Fallback to avoid validation error
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images?.[0] || '',
                })),
                totalAmount: getCartTotal() + deliveryCharge,
                deliveryCharge: deliveryCharge,
                paymentMethod: paymentMethod,
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing',
                upiId: paymentMethod === 'upi' ? upiId : undefined,
                shippingAddress: address,
            };

            // For online payments, integrate with Razorpay
            if (paymentMethod !== 'cod') {
                // Create Razorpay order
                const orderResponse = await api.post('/payment/create-order', {
                    amount: getCartTotal() + deliveryCharge,
                    currency: 'INR',
                });

                if (!orderResponse.data?.data) {
                     throw new Error('Invalid response from payment server');
                }

                const { id: razorpayOrderId, amount } = orderResponse.data.data;

                // Initialize Razorpay checkout
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: amount,
                    currency: 'INR',
                    name: 'Agricart',
                    description: 'Farm Fresh Products',
                    order_id: razorpayOrderId,
                    handler: async function (response) {
                        try {
                            // Verify payment
                            const verifyResponse = await api.post('/payment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            if (verifyResponse.data.success) {
                                // Create order with payment details
                                orderData.razorpayOrderId = response.razorpay_order_id;
                                orderData.razorpayPaymentId = response.razorpay_payment_id;
                                orderData.paymentStatus = 'completed';

                                await api.post('/orders', orderData);

                                clearCart();
                                toast.success('Order placed successfully!');
                                navigate('/consumer/orders');
                            }
                        } catch (error) {
                            console.error('Payment verification failed:', error);
                            toast.error('Payment verification failed: ' + (error.response?.data?.message || error.message));
                            setProcessing(false);
                        }
                    },
                    prefill: {
                        name: address.fullName,
                        email: user.email || '',
                        contact: address.phone,
                    },
                    theme: {
                        color: '#16a34a',
                    },
                };

                const razorpay = new window.Razorpay(options);
                razorpay.open();

                razorpay.on('payment.failed', function (response) {
                    console.error('Payment failed:', response.error);
                    toast.error('Payment failed. Please try again.');
                    setProcessing(false);
                });

                // Note: We don't setProcessing(false) here because the modal is open
            } else {
                // For COD, directly create order
                await api.post('/orders', orderData);
                clearCart();
                toast.success('Order placed successfully! Pay on delivery.');
                navigate('/consumer/orders');
                setProcessing(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Checkout failed. Please try again.';
            toast.error(errMsg);
            setProcessing(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header role="Consumer" />

            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Order Items, Address & Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={getProductImage(item)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="font-semibold text-primary-600">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.fullName}
                                        onChange={(e) => handleAddressChange('fullName', e.target.value)}
                                        className="input-field"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={address.phone}
                                        onChange={(e) => handleAddressChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="input-field"
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 1 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine1}
                                        onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                                        className="input-field"
                                        placeholder="House No., Building Name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 2 (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={address.addressLine2}
                                        onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                                        className="input-field"
                                        placeholder="Road name, Area, Colony"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        className="input-field"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        className="input-field"
                                        placeholder="State"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={address.pincode}
                                        onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="input-field"
                                        placeholder="6-digit pincode"
                                        maxLength="6"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Payment Method</h2>
                            <div className="space-y-3">
                                {paymentOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <label
                                            key={option.id}
                                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === option.id
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-primary-300'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={option.id}
                                                checked={paymentMethod === option.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-5 h-5 text-primary-600"
                                            />
                                            <Icon className={`text-2xl ${option.color}`} />
                                            <span className="flex-1 font-medium text-gray-800">{option.name}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {/* UPI ID Input */}
                            {paymentMethod === 'upi' && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@paytm"
                                        className="input-field"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{getCartTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">₹{deliveryCharge}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-800">
                                    <span>Total Amount</span>
                                    <span>₹{getCartTotal() + deliveryCharge}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                                aria-label="Place order"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Place Order (${paymentMethod === 'cod' ? 'COD' : 'Pay Now'})`
                                )}
                            </button>

                            {paymentMethod === 'cod' && (
                                <p className="text-sm text-gray-600 mt-3 text-center">
                                    Pay cash when your order is delivered
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Checkout;
