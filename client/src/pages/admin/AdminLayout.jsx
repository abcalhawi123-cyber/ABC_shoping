import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

const AP = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';
const BG = '#6D1A36';

export default function AdminLayout({ children }) {
  const { logoutUser } = useAuth();
  const { t, brand } = useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { to: 'dashboard', label: `📊 ${t('dashboard')}` },
    { to: 'products',  label: `📦 ${t('products')}` },
    { to: 'orders',    label: `🛒 ${t('adminOrdersNav')}` },      // FIX Bug 5
    { to: 'categories',label: `🏷️ ${t('adminCategories')}` },
    { to: 'returns',   label: `🔄 ${t('adminReturns')}` },
    { to: 'shipping',  label: `🚚 ${t('adminShippingNav')}` },     // FIX Bug 5
    { to: 'reports',   label: `📈 ${t('adminReportsNav')}` },      // FIX Bug 5
  ];

  const out = () => { logoutUser(); navigate(`/${AP}/login`); };
  const close = () => setSidebarOpen(false);

  const Sidebar = ({ onNav }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 24, padding: '0 16px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{brand}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>Admin Panel</p>
      </div>
      <nav style={{ flex: 1 }}>
        {links.map(l => (
          <NavLink key={l.to} to={`/${AP}/${l.to}`} onClick={onNav}
            style={({ isActive }) => ({
              display: 'block', padding: '12px 20px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
              textDecoration: 'none', fontSize: 14,
              fontWeight: isActive ? 700 : 400,
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRight: isActive ? '3px solid #fff' : '3px solid transparent',
              transition: 'all 0.15s',
            })}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={out} style={{ margin: '0 16px 16px', padding: '10px', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
        🚪 {t('logout')}
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', direction: 'rtl' }}>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar" style={{ width: 220, background: BG, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <Sidebar onNav={() => {}} />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="admin-mobile-bar" style={{ display: 'none', background: BG, color: '#fff', padding: '12px 16px', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', padding: 0 }}>☰</button>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{brand}</span>
          <button onClick={out} style={{ marginInlineStart: 'auto', background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>{t('logout')}</button>
        </div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 98 }} />
            <div style={{ position: 'fixed', top: 0, right: 0, width: 240, height: '100vh', background: BG, zIndex: 99, overflowY: 'auto' }}>
              <button onClick={close} style={{ position: 'absolute', top: 12, left: 12, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
              <div style={{ marginTop: 50 }}><Sidebar onNav={close} /></div>
            </div>
          </>
        )}

        <main className="admin-main" style={{ flex: 1, background: '#f4f0f1', padding: '28px 24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-bar { display: flex !important; }
          .admin-main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
