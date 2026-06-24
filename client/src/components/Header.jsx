import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { t, lang, toggleLang } = useLang();
  const { itemCount } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const search = e => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/products?q=${encodeURIComponent(q.trim())}`);
      setQ('');
      setMenuOpen(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header style={{ background: '#1a3a5c', color: '#fff', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      {/* Main header row */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, height: 60, padding: '0 16px' }}>

        {/* Logo */}
        <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f8ad9d', whiteSpace: 'nowrap' }}>
            ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}
          </span>
        </Link>

        {/* Search — hidden on very small screens, shown on tablet+ */}
        <form onSubmit={search} style={{ flex: 1, minWidth: 0, display: 'flex' }} className="desktop-search">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('search')}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 24,
              border: '1px solid rgba(248,173,157,0.4)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </form>

        {/* Right side: cart + lang + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Cart icon — always visible */}
          <Link to="/cart" style={{ ...N, position: 'relative' }} onClick={closeMenu}>
            🛒
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#f8ad9d', color: '#1a3a5c',
                borderRadius: '50%', width: 17, height: 17,
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
              }}>
                {itemCount}
              </span>
            )}
          </Link>

          {/* Language toggle — always visible */}
          <button onClick={toggleLang} style={{
            padding: '5px 10px',
            background: '#f8ad9d',
            color: '#1a3a5c',
            border: 'none',
            borderRadius: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: 12,
            flexShrink: 0,
          }}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="hamburger"
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 22,
              padding: '4px',
              display: 'none', // shown via CSS on mobile
            }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* Desktop nav links */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link to="/products" style={N} onClick={closeMenu}>{t('products')}</Link>
            {user ? (
              <>
                <Link to="/my-orders" style={N} onClick={closeMenu}>📦 {t('myOrders')}</Link>
                <button onClick={() => { logoutUser(); closeMenu(); }} style={{ ...N, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link to="/login" style={N} onClick={closeMenu}>{t('login')}</Link>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="mobile-search" style={{ padding: '0 16px 10px', display: 'none' }}>
        <form onSubmit={search}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('search')}
            style={{
              width: '100%',
              padding: '9px 16px',
              borderRadius: 24,
              border: '1px solid rgba(248,173,157,0.4)',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </form>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav style={{
          background: '#16304d',
          padding: '8px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Link to="/products" onClick={closeMenu} style={MN}>{t('products')}</Link>
          <Link to="/cart" onClick={closeMenu} style={MN}>
            🛒 {t('cart')} {itemCount > 0 && `(${itemCount})`}
          </Link>
          {user ? (
            <>
              <Link to="/my-orders" onClick={closeMenu} style={MN}>📦 {t('myOrders')}</Link>
              <button onClick={() => { logoutUser(); closeMenu(); }} style={{ ...MN, background: 'none', border: 'none', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left', width: '100%' }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} style={MN}>{t('login')}</Link>
              <Link to="/register" onClick={closeMenu} style={MN}>{t('register')}</Link>
            </>
          )}
        </nav>
      )}

      {/* Responsive CSS injected */}
      <style>{`
        @media (max-width: 640px) {
          .hamburger { display: block !important; }
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .mobile-search { display: block !important; }
        }
      `}</style>
    </header>
  );
}

const N = {
  color: '#fff',
  textDecoration: 'none',
  padding: '6px 8px',
  borderRadius: 6,
  fontSize: 13,
  position: 'relative',
  whiteSpace: 'nowrap',
};

const MN = {
  color: '#fff',
  textDecoration: 'none',
  padding: '12px 8px',
  fontSize: 15,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'block',
};
