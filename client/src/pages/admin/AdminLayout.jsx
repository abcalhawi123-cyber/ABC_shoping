import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

const links = [
  { to: 'dashboard', label: '📊 لوحة التحكم' },
  { to: 'products', label: '📦 المنتجات' },
  { to: 'orders', label: '🛒 الطلبات' },
  { to: 'shipping', label: '🚚 الشحن' },
  { to: 'reports', label: '📈 التقارير' },
];

export default function AdminLayout({ children }) {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate(`/${ADMIN_PATH}/login`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#1a3a5c',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28, padding: '0 16px' }}>
          <h2 style={{ color: '#f8ad9d', margin: 0, fontSize: 22, letterSpacing: 1 }}>ABC الحاوي</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>لوحة الإدارة</p>
        </div>

        <nav style={{ flex: 1 }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={`/${ADMIN_PATH}/${link.to}`}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: isActive ? '#f8ad9d' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 700 : 400,
                background: isActive ? 'rgba(248,173,157,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #f8ad9d' : '3px solid transparent',
                transition: 'all 0.2s',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            margin: '0 16px 16px',
            padding: '10px',
            background: 'rgba(231,76,60,0.2)',
            color: '#ff8080',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          🚪 تسجيل الخروج
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f0f2f5', padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
