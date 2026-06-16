import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

import Header from './components/Header';
import Footer from './components/Footer';

// Pages (lazy-loadable)
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTrack from './pages/OrderTrack';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminShipping from './pages/admin/AdminShipping';
import AdminReports from './pages/admin/AdminReports';

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

// Guard for admin routes
function AdminGuard({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) return <Navigate to={`/${ADMIN_PATH}/login`} replace />;
  return children;
}

function CustomerLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Header />
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '24px 16px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-center" />
            <Routes>
              {/* Customer routes */}
              <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
              <Route path="/products/:slug" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
              <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
              <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
              <Route path="/order-confirmation/:id" element={<CustomerLayout><OrderConfirmation /></CustomerLayout>} />
              <Route path="/track/:id" element={<CustomerLayout><OrderTrack /></CustomerLayout>} />
              <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
              <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />

              {/* Admin routes — hidden path */}
              <Route path={`/${ADMIN_PATH}/login`} element={<AdminLogin />} />
              <Route path={`/${ADMIN_PATH}/dashboard`} element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              <Route path={`/${ADMIN_PATH}/products`} element={<AdminGuard><AdminProducts /></AdminGuard>} />
              <Route path={`/${ADMIN_PATH}/orders`} element={<AdminGuard><AdminOrders /></AdminGuard>} />
              <Route path={`/${ADMIN_PATH}/shipping`} element={<AdminGuard><AdminShipping /></AdminGuard>} />
              <Route path={`/${ADMIN_PATH}/reports`} element={<AdminGuard><AdminReports /></AdminGuard>} />

              <Route path="*" element={<CustomerLayout><div style={{textAlign:'center',padding:'60px 0'}}><h2>404 — الصفحة غير موجودة</h2></div></CustomerLayout>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
