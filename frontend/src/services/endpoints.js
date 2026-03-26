import api from './api';

// ==================== PRODUCTS ====================

export const productAPI = {
  // Get all products with filters
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/products?${params}`);
  },

  // Get single product
  getProductById: (id) => api.get(`/products/${id}`),

  // Create product (Farmer only)
  createProduct: (data) => api.post('/products', data),

  // Update product (Farmer only)
  updateProduct: (id, data) => api.put(`/products/${id}`, data),

  // Delete product (Farmer only)
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Get farmer's products
  getMyProducts: () => api.get('/products/farmer/my-products'),
};

// ==================== USERS ====================

export const userAPI = {
  // Sync user to database (after Clerk login)
  syncUser: (userData) => api.post('/users/sync', userData),

  // Get current user profile
  getProfile: () => api.get('/users/profile'),

  // Update user profile
  updateProfile: (data) => api.put('/users/profile', data),
};

// ==================== ORDERS ====================

export const orderAPI = {
  // Create new order
  createOrder: (data) => api.post('/orders', data),

  // Get consumer's orders
  getMyOrders: () => api.get('/orders/my-orders'),

  // Get farmer's sales orders
  getFarmerOrders: () => api.get('/orders/farmer/sales'),

  // Get single order
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Update order after payment
  updateOrderPayment: (id, data) => api.put(`/orders/${id}/payment`, data),
};

// ==================== PAYMENTS ====================

export const paymentAPI = {
  // Get Razorpay key
  getRazorpayKey: () => api.get('/payment/key'),

  // Create Razorpay order
  createRazorpayOrder: (data) => api.post('/payment/create-order', data),

  // Verify payment
  verifyPayment: (data) => api.post('/payment/verify', data),
};

// ==================== VOICE ====================

export const voiceAPI = {
  // Convert speech to text
  speechToText: (audioData) => api.post('/voice/speech-to-text', {
    audioData,
  }),
};

export default {
  product: productAPI,
  user: userAPI,
  order: orderAPI,
  payment: paymentAPI,
  voice: voiceAPI,
};
