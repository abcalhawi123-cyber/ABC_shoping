import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Products ──────────────────────────────────────────────
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (slug) => API.get(`/products/${slug}`);
export const createProduct = (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, data) => API.patch(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// ── Orders ────────────────────────────────────────────────
export const placeOrder = (data) => API.post('/orders', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getMyOrders = (page) => API.get('/orders/my/orders', { params: { page } });

// ── Reviews ───────────────────────────────────────────────
export const getReviews = (productId, page) => API.get(`/reviews/${productId}`, { params: { page } });
export const submitReview = (productId, data) => API.post(`/reviews/${productId}`, data);

// ── Shipping ──────────────────────────────────────────────
export const getShippingZones = () => API.get('/shipping');

// ── Auth ──────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const adminLogin = (data) => API.post('/auth/admin-login', data);

// ── Admin ─────────────────────────────────────────────────
const ADMIN = import.meta.env.VITE_ADMIN_PREFIX;
export const getDashboard = () => API.get(`/${ADMIN}/dashboard`);
export const getAdminOrders = (params) => API.get(`/${ADMIN}/orders`, { params });
export const updateOrderStatus = (id, data) => API.patch(`/orders/${id}/status`, data);
export const updateOrderPayment = (id, data) => API.patch(`/orders/${id}/payment`, data);
export const getAdminProducts = (params) => API.get(`/${ADMIN}/products`, { params });
export const exportReport = (format, startDate, endDate) =>
  API.get(`/${ADMIN}/reports/export`, { params: { format, startDate, endDate }, responseType: 'blob' });

// ── Shipping Admin ────────────────────────────────────────
export const addShippingZone = (data) => API.post('/shipping', data);
export const updateShippingZone = (id, data) => API.patch(`/shipping/${id}`, data);
export const deleteShippingZone = (id) => API.delete(`/shipping/${id}`);

// ── Reviews Admin ─────────────────────────────────────────
export const getPendingReviews = () => API.get('/reviews/admin/pending');
export const approveReview = (id) => API.patch(`/reviews/${id}/approve`);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
