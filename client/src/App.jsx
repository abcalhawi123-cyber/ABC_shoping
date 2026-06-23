import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { LangProvider } from './context/LangContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderTrack from './pages/OrderTrack';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminShipping from './pages/admin/AdminShipping';
import AdminReports from './pages/admin/AdminReports';

const AP = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

function Guard({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) return <Navigate to={`/${AP}/login`} replace />;
  return children;
}

function Layout({ children }) {
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
      <LangProvider>
        <AuthProvider>
          <CartProvider>
            <HashRouter>
              <Toaster position="top-center" />
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/products" element={<Layout><Products /></Layout>} />
                <Route path="/products/:slug" element={<Layout><ProductDetail /></Layout>} />
                <Route path="/cart" element={<Layout><Cart /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                <Route path="/order-confirmation/:id" element={<Layout><OrderConfirmation /></Layout>} />
                <Route path="/track/:id" element={<Layout><OrderTrack /></Layout>} />
                <Route path="/my-orders" element={<Layout><MyOrders /></Layout>} />
                <Route path="/login" element={<Layout><Login /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path={`/${AP}/login`} element={<AdminLogin />} />
                <Route path={`/${AP}/dashboard`} element={<Guard><AdminDashboard /></Guard>} />
                <Route path={`/${AP}/products`} element={<Guard><AdminProducts /></Guard>} />
                <Route path={`/${AP}/orders`} element={<Guard><AdminOrders /></Guard>} />
                <Route path={`/${AP}/shipping`} element={<Guard><AdminShipping /></Guard>} />
                <Route path={`/${AP}/reports`} element={<Guard><AdminReports /></Guard>} />
                <Route path="*" element={<Layout><div style={{textAlign:'center',padding:'80px 0'}}><h2>404</h2></div></Layout>} />
              </Routes>
            </HashRouter>
          </CartProvider>
        </AuthProvider>
      </LangProvider>
    </HelmetProvider>
  );
}
