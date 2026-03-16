import axios from 'axios';

const API = axios.create({ baseURL: "https://pizzastore-backend-cfpe.onrender.com/api" });

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth & Users
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const getAllUsers = () => API.get('/users');
export const updateUserRole = (id, data) => API.put(`/users/${id}/role`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
 
// Addresses
export const getAddresses = () => API.get('/address');
export const addAddress = (data) => API.post('/address', data);
export const updateAddress = (id, data) => API.put(`/address/${id}`, data);
export const deleteAddress = (id) => API.delete(`/address/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Menu Items
export const getMenuItems = () => API.get('/menu');
export const getMenuByCategory = (categoryId) => API.get(`/menu/category/${categoryId}`);
export const createMenuItem = (data) => API.post('/menu', data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Cart
export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (data) => API.put('/cart/update', data);
export const removeFromCart = (itemId) => API.delete(`/cart/${itemId}`);
export const clearCart = () => API.delete('/cart/clear');

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my-orders');
export const cancelOrder = (id) => API.put(`/orders/cancel/${id}`);
export const getAllOrders = () => API.get('/orders/all');
export const updateOrderStatus = (id, data) => API.put(`/orders/status/${id}`, data);
export const getMonthlyRevenue = () => API.get('/orders/revenue');

// Payments
export const createPayment = (data) => API.post('/payments', data);
export const getPaymentByOrder = (orderId) => API.get(`/payments/${orderId}`);

// Messages
export const sendMessage = (data) => API.post('/messages', data);
export const getMyMessages = () => API.get('/messages/my-messages');
export const getUnreadCount = () => API.get('/messages/unread-count');
export const markAsRead = (id) => API.put(`/messages/${id}/read`);
export const markAllMessagesAsRead = () => API.put('/messages/mark-all-read');