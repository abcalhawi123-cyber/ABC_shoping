import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AP = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const out = () => { logoutUser(); navigate(`/${AP}/login`); };
  const close = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl', position: 'relative' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: 220,
          background: '#1a3a5c',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 16px' }}>
          <h2 style={{ color: '#f8ad9d', margin: 0, fontSize: 18 }}>ABC الحاوي</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>لوحة الإدارة</p>
        </div>

        <nav style={{ flex: 1 }}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={`/${AP}/${l.to}`}
              onClick={close}
              style={({ isActive }) => ({
                display: 'block',
                padding: '12px 20px',
                color: isActive ? '#f8ad9d' : 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 700 : 400,
                background: isActive ? 'rgba(248,173,157,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #f8ad9d' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={out} style={{ margin: '0 16px 16px', padding: '10px', background: 'rgba(231,76,60,0.2)', color: '#ff8080', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          🚪 تسجيل الخروج
        </button>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="admin-mobile-bar" style={{ display: 'none', background: '#1a3a5c', color: '#fff', padding: '12px 16px', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 0 }}>
            ☰
          </button>
          <span style={{ color: '#f8ad9d', fontWeight: 700 }}>ABC الحاوي — الإدارة</span>
          <button onClick={out} style={{ marginInlineStart: 'auto', background: 'rgba(231,76,60,0.3)', border: 'none', color: '#ff8080', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            خروج
          </button>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div style={{ position: 'fixed', top: 0, right: 0, width: 240, height: '100vh', background: '#1a3a5c', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '20px 0', boxShadow: '-4px 0 20px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20, padding: '0 16px' }}>
              <h2 style={{ color: '#f8ad9d', margin: 0, fontSize: 18 }}>ABC الحاوي</h2>
              <button onClick={close} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            {links.map(l => (
              <NavLink key={l.to} to={`/${AP}/${l.to}`} onClick={close} style={({ isActive }) => ({
                display: 'block', padding: '14px 20px', color: isActive ? '#f8ad9d' : '#fff', textDecoration: 'none', fontSize: 15, fontWeight: isActive ? 700 : 400, borderBottom: '1px solid rgba(255,255,255,0.08)',
              })}>
                {l.label}
              </NavLink>
            ))}
          </div>
        )}

        <main className="admin-main" style={{ flex: 1, background: '#f0f2f5', padding: '28px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-bar { display: flex !important; }
          .admin-main { padding: 16px !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
