import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/#/login';
  }
  return Promise.reject(err);
});

// Products
export const getProducts = p => API.get('/products', { params: p });
export const getProduct = slug => API.get(`/products/${slug}`);
export const createProduct = d => API.post('/products', d, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, d) => API.patch(`/products/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = id => API.delete(`/products/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = d => API.post('/categories', d);
export const updateCategory = (id, d) => API.patch(`/categories/${id}`, d);
export const deleteCategory = id => API.delete(`/categories/${id}`);

// Orders
export const placeOrder = d => API.post('/orders', d, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getOrder = id => API.get(`/orders/${id}`);
export const getMyOrders = p => API.get('/orders/my/orders', { params: { page: p } });

// Returns
export const submitReturn = d => API.post('/returns', d);
export const getAdminReturns = p => API.get('/returns', { params: p });
export const updateReturn = (id, d) => API.patch(`/returns/${id}`, d);

// Reviews
export const getReviews = (pid, p) => API.get(`/reviews/${pid}`, { params: { page: p } });
export const submitReview = (pid, d) => API.post(`/reviews/${pid}`, d);

// Shipping
export const getShippingZones = () => API.get('/shipping');
export const addShippingZone = d => API.post('/shipping', d);
export const updateShippingZone = (id, d) => API.patch(`/shipping/${id}`, d);
export const deleteShippingZone = id => API.delete(`/shipping/${id}`);

// Auth
export const register = d => API.post('/auth/register', d);
export const login = d => API.post('/auth/login', d);
export const adminLogin = d => API.post('/auth/admin-login', d);

// Admin
const A = import.meta.env.VITE_ADMIN_PREFIX;
export const getDashboard = () => API.get(`/${A}/dashboard`);
export const getAdminOrders = p => API.get(`/${A}/orders`, { params: p });
export const getAdminProducts = p => API.get(`/${A}/products`, { params: p });
export const updateOrderStatus = (id, d) => API.patch(`/orders/${id}/status`, d);
export const updateOrderPayment = (id, d) => API.patch(`/orders/${id}/payment`, d);
export const exportReport = (fmt, s, e) => API.get(`/${A}/reports/export`, { params: { format: fmt, startDate: s, endDate: e }, responseType: 'blob' });
export const getPendingReviews = () => API.get('/reviews/admin/pending');
export const approveReview = id => API.patch(`/reviews/${id}/approve`);
export const deleteReview = id => API.delete(`/reviews/${id}`);
