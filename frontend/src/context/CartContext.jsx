import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Load & Merge Logic
    useEffect(() => {
        const loadCart = async () => {
            // 1. Get local cart
            const localCart = JSON.parse(localStorage.getItem('agricart_cart') || '[]');

            if (isAuthenticated && user?.role?.toLowerCase() === 'consumer') {
                // 2. If logged in, merge local cart with backend (if local items exist)
                try {
                    setLoading(true);
                    let response;

                    if (localCart.length > 0) {
                        console.log('Merging local cart with backend...', localCart);
                        response = await api.post('/cart/merge', { localItems: localCart });
                        // Clear local storage after successful merge
                        localStorage.removeItem('agricart_cart');
                    } else {
                        response = await api.get('/cart');
                    }

                    if (response.data?.data?.items) {
                        // Backend returns items with populated productId
                        // We need to flatten it to match frontend structure expected by components
                        const formattedItems = response.data.data.items.map(item => ({
                            ...item.productId,
                            productId: item.productId._id,
                            _id: item.productId._id, // Keep _id relative to Product for frontend consistency
                            quantity: item.quantity,
                            farmerId: item.farmerId
                        }));
                        setCartItems(formattedItems);
                    }
                } catch (error) {
                    console.error('[CART] Failed to sync cart:', {
                        message: error.message,
                        status: error.status,
                        code: error.code,
                        userId: user?.id,
                        userRole: user?.role,
                        isAuthenticated
                    });
                    
                    const errorMsg = error.message || error.error || 'Failed to sync cart with server';
                    toast.error(errorMsg);
                } finally {
                    setLoading(false);
                }
            } else if (!isAuthenticated) {
                // 3. Fallback to local storage for guests
                setCartItems(localCart);
            }
        };

        loadCart();
    }, [isAuthenticated, user]);

    // Save to localStorage when cart changes (Guest only)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('agricart_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isAuthenticated]);

    const addToCart = async (product, quantity = 1) => {
        try {
            if (isAuthenticated && user?.role?.toLowerCase() === 'consumer') {
                // API Call for authenticated users
                console.log('[CART] Adding to cart:', { productId: product._id, quantity });
                const response = await api.post('/cart', {
                    productId: product._id,
                    quantity
                });

                console.log('[CART] Add to cart response:', response.data);

                if (response.data?.data?.items) {
                    const formattedItems = response.data.data.items.map(item => ({
                        ...item.productId,
                        productId: item.productId._id,
                        _id: item.productId._id,
                        quantity: item.quantity,
                        farmerId: item.farmerId
                    }));
                    setCartItems(formattedItems);
                    toast.success('Added to cart');
                    console.log('[CART] Cart updated successfully');
                } else {
                    console.error('[CART] Unexpected response format:', response.data);
                    throw new Error('Unexpected response format from server');
                }
            } else {
                // Local State Logic for guests
                console.log('[CART] Adding to local cart (guest):', { productId: product._id, quantity });
                setCartItems((prev) => {
                    const existing = prev.find((item) => item._id === product._id);
                    if (existing) {
                        toast.success('Cart updated');
                        return prev.map((item) =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    }
                    toast.success('Added to cart');
                    return [...prev, { ...product, quantity }];
                });
            }
        } catch (error) {
            console.error('[CART] Add to cart error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to add item');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (isAuthenticated && user?.role?.toLowerCase() === 'consumer') {
                const response = await api.delete(`/cart/${productId}`);
                if (response.data?.data?.items) {
                    const formattedItems = response.data.data.items.map(item => ({
                        ...item.productId,
                        productId: item.productId._id,
                        _id: item.productId._id,
                        quantity: item.quantity,
                        farmerId: item.farmerId
                    }));
                    setCartItems(formattedItems);
                    toast.success('Removed from cart');
                }
            } else {
                setCartItems((prev) => prev.filter((item) => item._id !== productId));
                toast.success('Removed from cart');
            }
        } catch (error) {
            console.error('Remove cart item error:', error);
            toast.error('Failed to remove item');
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        try {
            if (isAuthenticated && user?.role?.toLowerCase() === 'consumer') {
                const response = await api.put(`/cart/${productId}`, { quantity });
                if (response.data?.data?.items) {
                    const formattedItems = response.data.data.items.map(item => ({
                        ...item.productId,
                        productId: item.productId._id,
                        _id: item.productId._id,
                        quantity: item.quantity,
                        farmerId: item.farmerId
                    }));
                    setCartItems(formattedItems);
                }
            } else {
                setCartItems((prev) =>
                    prev.map((item) =>
                        item._id === productId ? { ...item, quantity } : item
                    )
                );
            }
        } catch (error) {
            console.error('Update quantity error:', error);
            toast.error(error.response?.data?.message || 'Failed to update quantity');
        }
    };

    const clearCart = async () => {
        try {
            if (isAuthenticated && user?.role?.toLowerCase() === 'consumer') {
                await api.delete('/cart');
            }
            setCartItems([]);
            // Also clear local just in case
            localStorage.removeItem('agricart_cart');
        } catch (error) {
            console.error('Clear cart error:', error);
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
                loading
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
